-- AlterTable: add weekly digest opt-in to Organization
ALTER TABLE "Organization" ADD COLUMN "weeklyDigestEnabled" BOOLEAN NOT NULL DEFAULT false;
