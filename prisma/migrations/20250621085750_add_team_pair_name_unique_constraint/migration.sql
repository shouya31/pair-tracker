/*
  Warnings:

  - A unique constraint covering the columns `[teamId,name]` on the table `Pair` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pair_teamId_name_key" ON "Pair"("teamId", "name");
