import { NextResponse } from "next/server";
import { runDueMonitors } from "@/lib/monitor";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runDueMonitors(50);
  return NextResponse.json({ ok: true, processed: results.length, results });
}
