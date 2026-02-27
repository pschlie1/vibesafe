import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAddApp, logAudit } from "@/lib/tenant";
import { createAppSchema } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apps = await db.monitoredApp.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: "desc" },
    include: {
      monitorRuns: {
        orderBy: { startedAt: "desc" },
        include: { findings: true },
        take: 1,
      },
    },
  });

  return NextResponse.json({ apps });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createAppSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Check plan limits
  const { allowed, reason } = await canAddApp(session.orgId);
  if (!allowed) {
    return NextResponse.json({ error: { message: reason } }, { status: 403 });
  }

  // Check for duplicate URL within org
  const existing = await db.monitoredApp.findFirst({
    where: { orgId: session.orgId, url: parsed.data.url },
  });

  if (existing) {
    return NextResponse.json(
      { error: { message: `This URL is already monitored as "${existing.name}"` } },
      { status: 409 },
    );
  }

  const app = await db.monitoredApp.create({
    data: {
      orgId: session.orgId,
      ...parsed.data,
      nextCheckAt: new Date(),
    },
  });

  await logAudit(session, "app.created", app.id, `Registered ${app.name} (${app.url})`);

  return NextResponse.json({ app }, { status: 201 });
}
