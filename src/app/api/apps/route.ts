import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAppSchema } from "@/lib/types";

export async function GET() {
  const apps = await db.monitoredApp.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      monitorRuns: {
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json({ apps });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createAppSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const app = await db.monitoredApp.create({
    data: {
      ...parsed.data,
      nextCheckAt: new Date(),
    },
  });

  return NextResponse.json({ app }, { status: 201 });
}
