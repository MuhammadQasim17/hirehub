-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'CLOSED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE';
