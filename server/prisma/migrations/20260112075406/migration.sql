/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `people` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "people" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "people_userId_key" ON "people"("userId");

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
