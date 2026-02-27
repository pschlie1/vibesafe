import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiKey } from "@/lib/api-auth";
import { runHttpScanForApp } from "@/lib/scanner-http";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const orgId = await authenticateApiKey(req);
  if (!orgId) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  const { id } = await params;

  // Verify app belongs to org
  const app = await db.monitoredApp.findFirst({ where: { id, orgId } });
  if (!app) return NextResponse.json({ error: "App not found" }, { status: 404 });

  try {
    const result = await runHttpScanForApp(id);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scan failed" },
      { status: 500 },
    );
  }
}
