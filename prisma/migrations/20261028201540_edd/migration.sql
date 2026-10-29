/*
  Warnings:

  - You are about to drop the column `content` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `originalName` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `totalSeats` on the `Program` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userAgent` on the `Session` table. All the data in the column will be lost.
  - The `id` column on the `Session` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `body` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacity` to the `Program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AnnouncementScope" AS ENUM ('GENERAL', 'PROGRAM');

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_programId_fkey";

-- DropIndex
DROP INDEX "Announcement_createdAt_idx";

-- DropIndex
DROP INDEX "Application_userId_idx";

-- DropIndex
DROP INDEX "Program_title_idx";

-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "content",
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "scope" "AnnouncementScope" NOT NULL DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedBy" INTEGER;

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "originalName",
ADD COLUMN     "size" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Program" DROP COLUMN "imageUrl",
DROP COLUMN "totalSeats",
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "imagePath" TEXT,
ADD COLUMN     "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "userAgent",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "Schedule";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "ProgramSession" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "meetingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgramSession_programId_startsAt_idx" ON "ProgramSession"("programId", "startsAt");

-- CreateIndex
CREATE INDEX "Announcement_scope_createdAt_idx" ON "Announcement"("scope", "createdAt");

-- CreateIndex
CREATE INDEX "Application_userId_createdAt_idx" ON "Application"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Program_status_title_idx" ON "Program"("status", "title");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "ProgramSession" ADD CONSTRAINT "ProgramSession_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
