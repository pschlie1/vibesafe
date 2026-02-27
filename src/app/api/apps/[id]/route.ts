import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/tenant";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const app = await db.monitoredApp.findFirst({
    where: { id, orgId: session.orgId },
    include: {
      monitorRuns: {
        orderBy: { startedAt: "desc" },
        include: { findings: { orderBy: { severity: "asc" } } },
        take: 20,
      },
    },
  });

  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ app });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify ownership
  const app = await db.monitoredApp.findFirst({
    where: { id, orgId: session.orgId },
  });

  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.monitoredApp.delete({ where: { id } });
  await logAudit(session, "app.deleted", id, `Removed ${app.name}`);

  return NextResponse.json({ ok: true });
}
