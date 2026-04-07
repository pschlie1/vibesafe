-- Migration: add createdByUserId to ApiKey for user-level attribution and revocation
-- Audit-16 Focus 5: when a team member is removed, their API keys must be revocable.
-- onDelete: SetNull ensures the field is nulled (not cascaded) when the user is deleted,
-- giving the org admin visibility into formerly-attributed keys.

ALTER TABLE "ApiKey" ADD COLUMN "createdByUserId" TEXT;

ALTER TABLE "ApiKey"
  ADD CONSTRAINT "ApiKey_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId")
  REFERENCES "User"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "ApiKey_createdByUserId_idx" ON "ApiKey"("createdByUserId");
