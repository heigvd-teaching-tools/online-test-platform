-- DropForeignKey
ALTER TABLE "QuestionToTag" DROP CONSTRAINT "QuestionToTag_label_fkey";

-- DropIndex
DROP INDEX "Tag_label_key";

-- Drop the primary key constraint on Tag
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_pkey";

-- Add the new groupId column to the QuestionToTag table
ALTER TABLE "QuestionToTag" ADD COLUMN "groupId" TEXT;

-- Update the groupId in the QuestionToTag table based on the related Question
UPDATE "QuestionToTag" AS qtt
SET "groupId" = q."groupId"
FROM "Question" AS q
WHERE qtt."questionId" = q."id";

-- Ensure the new column is not nullable
ALTER TABLE "QuestionToTag" ALTER COLUMN "groupId" SET NOT NULL;

-- Remove duplicate entries in Tag table
DELETE FROM "Tag"
USING (
  SELECT "label", "groupId", MIN(ctid) as ctid
  FROM "Tag"
  GROUP BY "label", "groupId"
  HAVING COUNT(*) > 1
) as duplicates
WHERE "Tag"."label" = duplicates."label"
AND "Tag"."groupId" = duplicates."groupId"
AND "Tag".ctid <> duplicates.ctid;

-- Create missing entries in Tag table
INSERT INTO "Tag" ("label", "groupId", "createdAt", "updatedAt")
SELECT DISTINCT qtt."label", qtt."groupId", NOW(), NOW()
FROM "QuestionToTag" qtt
LEFT JOIN "Tag" t
ON qtt."groupId" = t."groupId" AND qtt."label" = t."label"
WHERE t."label" IS NULL;

-- AlterTable to change the primary keys
ALTER TABLE "QuestionToTag" DROP CONSTRAINT "QuestionToTag_pkey",
ADD CONSTRAINT "QuestionToTag_pkey" PRIMARY KEY ("questionId", "groupId", "label");

ALTER TABLE "Tag" ADD CONSTRAINT "Tag_pkey" PRIMARY KEY ("groupId", "label");

-- AddForeignKey back with the new composite keys
ALTER TABLE "QuestionToTag" ADD CONSTRAINT "QuestionToTag_groupId_label_fkey" FOREIGN KEY ("groupId", "label") REFERENCES "Tag"("groupId", "label") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Tag_groupId_label_key" ON "Tag"("groupId", "label");