# Conversion Instrumentation (Phase 3)

Scantient uses the existing internal analytics sink (`trackEvent` → `AuditLog`) gated by:

- `INTERNAL_ANALYTICS_ENABLED=1`

## Events added

- `builder_to_starter`
  - emitted when subscription tier transitions `FREE` → `STARTER`
  - source: Stripe webhook (`checkout.session.completed` or `customer.subscription.updated`)
- `starter_to_pro`
  - emitted when subscription tier transitions `STARTER` → `PRO`
  - source: Stripe webhook
- `subscription_churned`
  - emitted when a paid subscription is deleted and tier is reset to `FREE`
  - source: `customer.subscription.deleted`

## Privacy + safety

- Events are non-blocking; failures are swallowed in analytics path.
- Properties are redacted using existing key filter rules (no tokens/secrets/PII fields).

## Reporting

`getGtmBaseline()` now includes these event counts and derived rates:

- `builderToStarterRatePct`
- `starterToProRatePct`
- `paidChurnRatePct`

No new vendor analytics dependencies were introduced.
