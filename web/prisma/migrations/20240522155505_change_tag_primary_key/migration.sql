-- Add the new groupId column to the QuestionToTag table
ALTER TABLE "QuestionToTag" ADD COLUMN "groupId" TEXT;

-- Update the groupId in the QuestionToTag table based on the related Tag
UPDATE "QuestionToTag" AS qtt
SET "groupId" = t."groupId"
FROM "Tag" AS t
WHERE qtt."label" = t."label";

-- Ensure the new column is not nullable
ALTER TABLE "QuestionToTag" ALTER COLUMN "groupId" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "QuestionToTag" DROP CONSTRAINT "QuestionToTag_label_fkey";

-- DropIndex
DROP INDEX "Tag_label_key";

-- AlterTable to change the primary keys
ALTER TABLE "QuestionToTag" DROP CONSTRAINT "QuestionToTag_pkey",
ADD CONSTRAINT "QuestionToTag_pkey" PRIMARY KEY ("questionId", "groupId", "label");

ALTER TABLE "Tag" DROP CONSTRAINT "Tag_pkey",
ADD CONSTRAINT "Tag_pkey" PRIMARY KEY ("groupId", "label");

-- AddForeignKey back with the new composite keys
ALTER TABLE "QuestionToTag" ADD CONSTRAINT "QuestionToTag_groupId_label_fkey" FOREIGN KEY ("groupId", "label") REFERENCES "Tag"("groupId", "label") ON DELETE CASCADE ON UPDATE CASCADE;
