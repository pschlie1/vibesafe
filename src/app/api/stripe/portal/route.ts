import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await db.organization.findUnique({ where: { id: session.orgId } });
  if (!org?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/settings/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
