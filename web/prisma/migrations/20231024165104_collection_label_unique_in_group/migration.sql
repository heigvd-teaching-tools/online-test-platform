/*
  Warnings:

  - A unique constraint covering the columns `[groupId,label]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Collection_label_key";

-- CreateIndex
CREATE UNIQUE INDEX "Collection_groupId_label_key" ON "Collection"("groupId", "label");
