-- Student profile fields are intentionally nullable so existing users can
-- complete onboarding after this migration is deployed.
ALTER TABLE "User"
  ADD COLUMN "level" INTEGER,
  ADD COLUMN "programme" TEXT,
  ADD COLUMN "cohortYear" INTEGER,
  ADD COLUMN "levelConfirmedAt" TIMESTAMP(3);

CREATE TABLE "AuditLog" (
  "id" SERIAL NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "metadata" JSONB,
  "actorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
