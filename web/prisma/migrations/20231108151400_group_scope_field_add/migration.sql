/*
  Warnings:

  - A unique constraint covering the columns `[scope]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Group_scope_key" ON "Group"("scope");
