/*
  Warnings:

  - You are about to drop the column `password_hash` on the `AuthUser` table. All the data in the column will be lost.
  - You are about to drop the `Movie` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expiredAt` to the `AuthUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionToken` to the `AuthUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verified` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_authorId_fkey";

-- AlterTable
ALTER TABLE "AuthUser" DROP COLUMN "password_hash",
ADD COLUMN     "expiredAt" TEXT NOT NULL,
ADD COLUMN     "sessionToken" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "verified" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "Movie";

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" INTEGER,
    "votedUp" INTEGER NOT NULL,
    "votedDown" INTEGER NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoStatus" (
    "id" SERIAL NOT NULL,
    "videoID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "VideoStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
