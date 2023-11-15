/*
  Warnings:

  - A unique constraint covering the columns `[groupId,label]` on the table `Evaluation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Evaluation_label_key";

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_groupId_label_key" ON "Evaluation"("groupId", "label");
