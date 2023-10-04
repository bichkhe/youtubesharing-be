/*
  Warnings:

  - The primary key for the `VideoStatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `VideoStatus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VideoStatus" DROP CONSTRAINT "VideoStatus_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "VideoStatus_pkey" PRIMARY KEY ("videoID", "userID");
