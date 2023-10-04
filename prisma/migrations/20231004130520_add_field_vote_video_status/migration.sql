-- CreateEnum
CREATE TYPE "VoteKind" AS ENUM ('UP', 'DOWN');

-- AlterTable
ALTER TABLE "VideoStatus" ADD COLUMN     "vote" "VoteKind" NOT NULL DEFAULT 'UP';
