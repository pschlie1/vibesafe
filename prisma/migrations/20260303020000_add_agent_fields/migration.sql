-- AddColumns: agent fields to MonitoredApp
ALTER TABLE "MonitoredApp" ADD COLUMN IF NOT EXISTS "agentEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MonitoredApp" ADD COLUMN IF NOT EXISTS "agentKeyHash" TEXT;
ALTER TABLE "MonitoredApp" ADD COLUMN IF NOT EXISTS "agentKeyPrefix" TEXT;
ALTER TABLE "MonitoredApp" ADD COLUMN IF NOT EXISTS "agentLastSeenAt" TIMESTAMP(3);
ALTER TABLE "MonitoredApp" ADD CONSTRAINT IF NOT EXISTS "MonitoredApp_agentKeyHash_key" UNIQUE ("agentKeyHash");
