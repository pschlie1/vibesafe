import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendTestNotification } from "@/lib/alerts";

const testSchema = z.object({
  configId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = testSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify the config belongs to the user's org
  const config = await db.alertConfig.findFirst({
    where: { id: parsed.data.configId, orgId: session.orgId },
  });
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await sendTestNotification(config.id);
    return NextResponse.json({ ok: true, message: "Test notification sent" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send test notification" },
      { status: 500 },
    );
  }
}
