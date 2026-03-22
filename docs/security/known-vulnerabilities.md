# Known Vulnerabilities

This document tracks security vulnerabilities that cannot be auto-remediated via `npm audit fix` and describes the mitigation in place.

---

## HIGH . serialize-javascript ≤ 7.0.2 (build-time only)

**CVE / Advisory:** [GHSA-5c6j-r48x-rmvq](https://github.com/advisories/GHSA-5c6j-r48x-rmvq)  
**Severity:** HIGH  
**Affected package:** `serialize-javascript` (transitive build-time dependency)  
**Dependency path:** `@sentry/nextjs` → `@sentry/webpack-plugin` → `webpack` → `terser-webpack-plugin` → `serialize-javascript`  
**Detected:** 2026-03-01 (audit-14)  
**Count:** 5 HIGH findings (all same root cause)

### Why we cannot auto-fix

Running `npm audit fix` produces no change. The only fix option is `npm audit fix --force`, which would **downgrade** `@sentry/nextjs` from v10 to v7 . a major breaking change that would remove error-boundary integration, new hooks, and other features we rely on. We do not use `--force`.

The correct fix (upgrading `serialize-javascript` to ≥ 7.0.3 as a direct dep, or waiting for `@sentry/nextjs` to update its webpack peer) is blocked by the upstream dependency tree.

### Risk Assessment

| Factor | Assessment |
|--------|-----------|
| **Runtime exposure** | ❌ **None** . `serialize-javascript` is used only during `next build` (webpack bundling). It is not loaded in production at runtime. |
| **Attack surface** | Limited to the build pipeline (CI/CD environment). Not reachable by external users. |
| **Exploit prerequisite** | An attacker would need code-execution access inside the build environment, which is already a full compromise. |
| **Effective severity (adjusted)** | LOW . build-time only, no runtime impact |

### Mitigation

1. **Build environment isolation:** The build runs in a dedicated CI/CD environment (GitHub Actions) with restricted access. Secrets are never exposed in build artifacts.
2. **Dependency pinning:** We pin `@sentry/nextjs` to `^10.40.0` and keep it updated as new patch releases appear that may pull in a fixed `serialize-javascript`.
3. **Monitoring:** This document is reviewed with each major `@sentry/nextjs` release. Once a patch is available that fixes the transitive dep without a breaking change, it will be applied immediately.

### Resolution criteria

- [ ] `@sentry/nextjs` releases a patch that resolves the `serialize-javascript` transitive vulnerability without requiring a major version rollback.
- [ ] At that point: `npm update @sentry/nextjs && npm audit` should report 0 HIGH/CRITICAL issues.

---

*Last reviewed: 2026-03-01 (audit-14)*  
*Reviewer: Dooder (automated audit)*
