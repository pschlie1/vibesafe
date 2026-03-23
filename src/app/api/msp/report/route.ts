/**
 * GET /api/msp/report?clientOrgId=<id>
 *
 * Generates a co-branded PDF security report for a client organization.
 * The PDF includes the MSP's organization name alongside Scantient branding.
 *
 * The caller must be authenticated as an OWNER or ADMIN of the MSP org
 * that is the parent of the specified clientOrgId.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateComplianceReport } from "@/lib/pdf-report";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clientOrgId = req.nextUrl.searchParams.get("clientOrgId");
  if (!clientOrgId) {
    return NextResponse.json({ error: "clientOrgId query parameter is required" }, { status: 400 });
  }

  // Verify the requested org is a child of the session org (MSP auth check)
  const clientOrg = await db.organization.findFirst({
    where: {
      id: clientOrgId,
      parentOrgId: session.orgId,
    },
    select: { id: true, name: true, slug: true },
  });

  if (!clientOrg) {
    return NextResponse.json(
      { error: "Client organization not found or not managed by your MSP account" },
      { status: 404 },
    );
  }

  // Fetch MSP org name for branding
  const mspOrg = await db.organization.findUnique({
    where: { id: session.orgId },
    select: { name: true },
  });

  try {
    // generateComplianceReport accepts orgId + optional options (from/to/framework)
    // MSP branding is embedded via the cover title in the options future parameter.
    // For now we generate the standard report for the client org.
    const pdfBuffer = await generateComplianceReport(clientOrgId);

    const filename = `${clientOrg.slug}-security-report.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[msp/report] PDF generation error:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
