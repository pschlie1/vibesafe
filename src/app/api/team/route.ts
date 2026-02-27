import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { canAddUser, logAudit } from "@/lib/tenant";
import { v4 as uuid } from "uuid";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await db.user.findMany({
    where: { orgId: session.orgId },
    select: { id: true, name: true, email: true, role: true, lastLoginAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ members });
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only OWNER and ADMIN can invite
  if (!["OWNER", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Only admins can invite team members" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { allowed, reason } = await canAddUser(session.orgId);
  if (!allowed) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  // Check if user already in org
  const existing = await db.user.findFirst({
    where: { email: parsed.data.email, orgId: session.orgId },
  });
  if (existing) {
    return NextResponse.json({ error: "User already in team" }, { status: 409 });
  }

  // Create user with temporary password (they'll be prompted to reset)
  const tempPassword = uuid().slice(0, 12);
  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      role: parsed.data.role,
      orgId: session.orgId,
      passwordHash: await hashPassword(tempPassword),
    },
    select: { id: true, name: true, email: true, role: true, lastLoginAt: true },
  });

  await logAudit(session, "user.invited", user.id, `Invited ${user.email} as ${user.role}`);

  return NextResponse.json({ user }, { status: 201 });
}
