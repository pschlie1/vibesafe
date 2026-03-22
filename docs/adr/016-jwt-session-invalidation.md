# ADR-016: JWT Session Invalidation Policy

**Date:** 2026-03-02  
**Status:** Accepted  
**Audit:** Audit-16 (Focus 3)

## Context

Scantient uses stateless JWT sessions stored in HttpOnly cookies (see ADR-002). Because JWTs are self-contained tokens, they cannot be immediately invalidated on the server side without either:

1. A server-side token store (deny-list or session version), requiring a DB hit on every request.
2. An acceptably short expiry window (the approach used here).

Two security-sensitive events require session invalidation:

- **Team member removal** . a removed user should lose API access as soon as possible.
- **Role downgrade** . a user whose role is changed should see the new role reflected promptly.

## Decision

### Mechanism: Periodic DB re-validation

`auth.ts` re-fetches user state from the database at most every `REFRESH_THRESHOLD` seconds (currently **5 minutes**). On each `getSession()` call:

1. If the JWT is less than 5 minutes old, it is trusted as-is (no DB hit).
2. If the JWT is 5+ minutes old, the user is re-fetched from the DB and a new JWT is issued.
   - If the user no longer exists (removed), `getSession()` returns `null` → request is rejected as Unauthorized.
   - If the user's role has changed, the new role is embedded in the refreshed JWT.

### Consequences for removal/role-change events

| Event | Worst-case lag | Outcome after lag |
|-------|---------------|-------------------|
| User removed | ≤ 5 minutes | Session returns null; all endpoints reject the request |
| Role downgraded | ≤ 5 minutes | New (lower) role enforced |
| Role upgraded | ≤ 5 minutes | New (higher) role enforced |

### API Key revocation (complementary fix . Audit-16, Focus 5)

Because JWT sessions have a 5-minute lag, **API keys created by a removed user are explicitly revoked at the time of removal** (synchronous DB delete before the user record is deleted). This eliminates the API key attack vector entirely and does not rely on session expiry.

### Why not a deny-list or session-version field?

- A deny-list requires a DB read (or Redis lookup) on **every request**, negating the stateless JWT benefit.
- A `sessionVersion` field on `User` achieves the same result but similarly requires a DB read on every request.
- For the current product tier and threat model, a 5-minute window is acceptable. The primary risk (lingering API keys after user removal) is mitigated by explicit key revocation (Focus 5).

### Future consideration

If requirements change (e.g., immediate session kill for enterprise compliance), the recommendation is:

1. Add `sessionVersion Int @default(0)` to `User`.
2. Embed `sessionVersion` in the JWT payload.
3. On every `getSession()` call, verify JWT `sessionVersion` matches the DB value (add a Redis cache to keep this cheap at scale).
4. On user removal or role change, increment `sessionVersion` → all existing JWTs immediately invalid.

## Consequences

- **Positive:** No DB hit on every request; stateless JWT benefit preserved.
- **Positive:** API keys are immediately revoked on user removal (no lag).
- **Negative:** Up to 5-minute window where a removed user's browser session remains technically valid for cookie-based requests.
- **Mitigation:** The 5-minute window is constrained; the user cannot create new sessions after removal (login will fail . the user record is deleted).
