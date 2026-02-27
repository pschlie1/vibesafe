import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const updateFindingSchema = z.object({
  status: z.enum(["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "IGNORED"]),
  notes: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateFindingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify the finding belongs to this org
  const finding = await db.finding.findFirst({
    where: {
      id,
      run: { app: { orgId: session.orgId } },
    },
  });

  if (!finding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.finding.update({
    where: { id },
    data: {
      status: parsed.data.status,
      notes: parsed.data.notes ?? finding.notes,
      ...(parsed.data.status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
      ...(parsed.data.status === "ACKNOWLEDGED" ? { acknowledgedAt: new Date() } : {}),
    },
  });

  return NextResponse.json({ finding: updated });
}
