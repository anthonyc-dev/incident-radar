/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "IncidentStatusLogs" DROP CONSTRAINT "IncidentStatusLogs_changed_by_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- AddForeignKey
ALTER TABLE "IncidentStatusLogs" ADD CONSTRAINT "IncidentStatusLogs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "User"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
