ALTER TABLE "User" ADD COLUMN "level" INTEGER;

-- Existing installations may contain early test records. Keep them valid while
-- making the field mandatory for all newly provisioned student access.
UPDATE "Resource" SET "academicYear" = 'Unknown' WHERE "academicYear" IS NULL;
ALTER TABLE "Resource" ALTER COLUMN "academicYear" SET NOT NULL;

ALTER TABLE "Course"
  ADD CONSTRAINT "Course_level_check" CHECK ("level" IN (100, 200, 300, 400)),
  ADD CONSTRAINT "Course_semester_check" CHECK ("semester" IN (1, 2));
ALTER TABLE "User"
  ADD CONSTRAINT "User_level_check" CHECK ("level" IS NULL OR "level" IN (100, 200, 300, 400));
ALTER TABLE "RepScope"
  ADD CONSTRAINT "RepScope_level_check" CHECK ("level" IN (100, 200, 300, 400));
ALTER TABLE "Resource"
  ADD CONSTRAINT "Resource_location_check" CHECK (
    ("storageKey" IS NOT NULL AND "externalUrl" IS NULL AND "fileSize" IS NOT NULL AND "mimeType" IS NOT NULL)
    OR ("storageKey" IS NULL AND "externalUrl" IS NOT NULL AND "fileSize" IS NULL AND "mimeType" IS NULL)
  );
