/*
  Warnings:

  - A unique constraint covering the columns `[groupId,label]` on the table `JamSession` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "JamSession_label_key";

-- CreateIndex
CREATE UNIQUE INDEX "JamSession_groupId_label_key" ON "JamSession"("groupId", "label");
