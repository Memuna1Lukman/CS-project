-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'REP', 'SUPER_ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "ResourceType" AS ENUM ('SLIDES', 'NOTES', 'PAST_QUESTION', 'ASSIGNMENT', 'SOLUTION', 'LAB_MANUAL', 'BOOK', 'OUTLINE', 'TIMETABLE', 'LINK', 'OTHER');
CREATE TYPE "ResourceStatus" AS ENUM ('ACTIVE', 'REMOVED');
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'FULFILLED', 'DISMISSED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL, "name" TEXT, "email" TEXT NOT NULL, "emailVerified" TIMESTAMP(3), "image" TEXT,
  "role" "Role" NOT NULL DEFAULT 'STUDENT', "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE', "indexNumber" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Account" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "provider" TEXT NOT NULL, "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT, "access_token" TEXT, "expires_at" INTEGER, "token_type" TEXT, "scope" TEXT, "id_token" TEXT, "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Session" (
  "id" TEXT NOT NULL, "sessionToken" TEXT NOT NULL, "userId" TEXT NOT NULL, "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "VerificationToken" ("identifier" TEXT NOT NULL, "token" TEXT NOT NULL, "expires" TIMESTAMP(3) NOT NULL);
CREATE TABLE "Department" ("id" SERIAL NOT NULL, "name" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Department_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Course" (
  "id" SERIAL NOT NULL, "code" TEXT NOT NULL, "title" TEXT NOT NULL, "level" INTEGER NOT NULL, "semester" INTEGER NOT NULL, "lecturer" TEXT,
  "departmentId" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Resource" (
  "id" SERIAL NOT NULL, "title" TEXT NOT NULL, "type" "ResourceType" NOT NULL, "academicYear" TEXT, "storageKey" TEXT, "fileSize" INTEGER,
  "mimeType" TEXT, "externalUrl" TEXT, "status" "ResourceStatus" NOT NULL DEFAULT 'ACTIVE', "downloadCount" INTEGER NOT NULL DEFAULT 0,
  "courseId" INTEGER NOT NULL, "uploadedById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RepScope" ("id" SERIAL NOT NULL, "userId" TEXT NOT NULL, "level" INTEGER NOT NULL, CONSTRAINT "RepScope_pkey" PRIMARY KEY ("id"));
CREATE TABLE "MaterialRequest" ("id" SERIAL NOT NULL, "courseCode" TEXT, "note" TEXT NOT NULL, "status" "RequestStatus" NOT NULL DEFAULT 'OPEN', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "MaterialRequest_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_indexNumber_key" ON "User"("indexNumber");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");
CREATE INDEX "Course_level_semester_idx" ON "Course"("level", "semester");
CREATE INDEX "Resource_courseId_type_idx" ON "Resource"("courseId", "type");
CREATE INDEX "Resource_academicYear_idx" ON "Resource"("academicYear");
CREATE UNIQUE INDEX "RepScope_userId_level_key" ON "RepScope"("userId", "level");
CREATE INDEX "MaterialRequest_status_idx" ON "MaterialRequest"("status");

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RepScope" ADD CONSTRAINT "RepScope_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
