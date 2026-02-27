import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const appCount = await db.monitoredApp.count();
    const lastRun = await db.monitorRun.findFirst({
      orderBy: { startedAt: "desc" },
      select: { startedAt: true, status: true },
    });

    return NextResponse.json({
      status: "healthy",
      version: "0.1.0",
      database: "connected",
      monitoredApps: appCount,
      lastScan: lastRun
        ? { at: lastRun.startedAt, status: lastRun.status }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
