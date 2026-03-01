# MSP / Agency Mode — Architecture Spec

*Status: Proposed. Not yet built. Requires PR #27 to merge first.*

---

## The Problem

MSPs (Managed Service Providers) manage IT infrastructure for 10-200 client organizations. Each client may have 5-50 apps. The MSP needs to:
- See all client apps in one dashboard
- Run scans on behalf of clients
- Generate per-client reports for billing and compliance evidence
- Set different alert recipients per client
- White-label the reports with their own brand

No competitor offers this today. Detectify has no MSP tier. Intruder has no multi-org management. This is an uncontested segment.

**Revenue model:** 200 MSP customers × $5,000/mo = $1M MRR from MSPs alone.

---

## Proposed Data Model Changes

### New: Organization type field
```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  type        OrgType  @default(STANDARD)
  parentOrgId String?  // set if this org is a client of an MSP
  parentOrg   Organization?  @relation("ClientOrgs", fields: [parentOrgId], references: [id])
  clientOrgs  Organization[] @relation("ClientOrgs")
  // ... rest of fields
}

enum OrgType {
  STANDARD   // regular customer
  MSP        // managed service provider
  CLIENT     // org managed by an MSP
}
```

### New: MSP-specific subscription tier
Add `MSP` to the SubscriptionTier enum:
- maxApps: effectively unlimited (counted across all client orgs)
- maxUsers: 10 (MSP staff)
- maxClientOrgs: 50 (starting tier)
- Features: all PRO features + white-label reports + client management dashboard

---

## New API Routes

### `GET /api/msp/clients`
- Requires MSP tier + OWNER/ADMIN role
- Returns all client orgs managed by this MSP
- Includes app count, finding count, last scan time per client

### `POST /api/msp/clients`
- Create a new client org under this MSP
- Body: `{ name: string, contactEmail: string }`
- Creates the org with `type: CLIENT`, `parentOrgId: session.orgId`
- Auto-generates an invite link for the client to accept

### `GET /api/msp/clients/[clientOrgId]/dashboard`
- Full dashboard data for a specific client org
- MSP staff can view all client data

### `GET /api/msp/clients/[clientOrgId]/report`
- Generate executive report for a specific client
- Same as `/api/reports/executive` but scoped to client org
- Optional: white-label with MSP name/logo

### `POST /api/msp/clients/[clientOrgId]/scan-all`
- Trigger immediate scans for all apps in a client org
- Useful for MSPs doing monthly security reviews

---

## New Dashboard Views

### MSP Overview Dashboard
- Table of all clients: name, app count, status summary, last scan, open critical findings
- Color-coded health status per client (green/yellow/red)
- "Scan all clients" bulk action
- Click into any client → their standard dashboard

### Client Isolation
- MSP staff see client data but clients do NOT see MSP internal data
- Client users see their own dashboard normally (they may not even know they're managed by an MSP)
- MSP staff are not added to client orgs — they access via the MSP parent relationship

---

## White-Label Reports

When generating executive reports for clients, optionally replace "Scantient" branding with the MSP's name and logo.

```typescript
// In report generation:
const reportBrand = mspOrg.whitelabelName ?? "Scantient";
const reportLogo = mspOrg.whitelabelLogoUrl ?? "/logo.svg";
```

Store whitelabel config in `OrgSettings` (new model or extend existing):
```prisma
model OrgSettings {
  orgId              String  @id
  whitelabelName     String?
  whitelabelLogoUrl  String?
  whitelabelDomain   String? // e.g. security.msp-name.com
}
```

---

## Pricing Tiers for MSP

| Tier | Price | Client Orgs | Apps per Client | Features |
|------|-------|-------------|-----------------|----------|
| MSP Starter | $999/mo | 10 | 15 | All PRO features |
| MSP Pro | $2,500/mo | 50 | 50 | + White-label reports |
| MSP Enterprise | $5,000/mo | 200 | Unlimited | + Custom domain, API access |

---

## Build Order

1. Prisma schema changes (Organization.type, Organization.parentOrgId)
2. MSP subscription tier + limits
3. `/api/msp/clients` CRUD routes
4. MSP overview dashboard (read-only client view)
5. White-label report generation
6. MSP-specific Stripe products and prices
7. Tests

Estimated build time: 2-3 focused sessions.

---

## App Discovery (Related Feature)

MSPs need to know about apps their clients are running that were NOT registered in Scantient. The "app discovery" feature would:

1. Given a registered domain (e.g. `client.com`), crawl DNS records to find subdomains
2. Check each subdomain for an HTTP response
3. Surface discovered URLs as "unregistered apps" in the MSP dashboard
4. One-click to add them to monitoring

Implementation:
- DNS lookup via `dns.resolveCname`, `dns.resolve` for common subdomain prefixes (app, api, admin, portal, internal, staging, beta, dev, test, dashboard, hr, finance)
- Store discovered URLs in new `DiscoveredApp` model
- Surface in dashboard as "Potential apps found — add to monitoring?"

This feature makes the MSP value proposition complete: "We found 12 apps in your clients' infrastructure they didn't know existed."
