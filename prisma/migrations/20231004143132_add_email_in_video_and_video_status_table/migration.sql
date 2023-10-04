/*
  Warnings:

  - Added the required column `email` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `VideoStatus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VideoStatus" ADD COLUMN     "email" TEXT NOT NULL;
