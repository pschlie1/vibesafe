import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const configs = await db.alertConfig.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ configs });
}

const createSchema = z.object({
  channel: z.enum(["EMAIL", "SLACK", "WEBHOOK"]),
  destination: z.string().min(3),
  minSeverity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("HIGH"),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const config = await db.alertConfig.create({
    data: {
      orgId: session.orgId,
      ...parsed.data,
    },
  });

  return NextResponse.json({ config }, { status: 201 });
}
