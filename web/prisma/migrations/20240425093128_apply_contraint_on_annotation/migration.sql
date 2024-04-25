/*
  Warnings:

  - A unique constraint covering the columns `[entityType,fileId]` on the table `Annotation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Annotation_userEmail_questionId_fileId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Annotation_entityType_fileId_key" ON "Annotation"("entityType", "fileId");
