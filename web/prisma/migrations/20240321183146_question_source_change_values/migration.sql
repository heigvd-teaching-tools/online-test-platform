BEGIN;

-- Create the new enum type
CREATE TYPE "QuestionSource_new" AS ENUM ('BANK', 'EVAL');

-- Remove the default value constraint temporarily
ALTER TABLE "Question" ALTER COLUMN "source" DROP DEFAULT;

-- Change the column type to the new enum using a case statement to remap values
ALTER TABLE "Question" 
ALTER COLUMN "source" TYPE "QuestionSource_new" USING 
CASE
    WHEN "source"::text = 'ORIGINAL' THEN 'BANK'::"QuestionSource_new"
    WHEN "source"::text = 'COPY' THEN 'EVAL'::"QuestionSource_new"
END;

-- Rename the old enum type as a backup measure (optional step, could be dropped immediately)
ALTER TYPE "QuestionSource" RENAME TO "QuestionSource_old";

-- Rename the new enum type to the original name
ALTER TYPE "QuestionSource_new" RENAME TO "QuestionSource";

-- Drop the old enum type
DROP TYPE "QuestionSource_old";

-- Reset the default for the altered column
ALTER TABLE "Question" ALTER COLUMN "source" SET DEFAULT 'BANK';

COMMIT;

-- Drop the foreign key constraint to ensure no integrity issues during the update
ALTER TABLE "Question" DROP CONSTRAINT "Question_sourceQuestionId_fkey";

-- Alter the table's default value if needed (seems redundant with the previous ALTER COLUMN SET DEFAULT)
ALTER TABLE "Question" ALTER COLUMN "source" SET DEFAULT 'BANK';

-- Re-add the foreign key constraint
ALTER TABLE "Question" ADD CONSTRAINT "Question_sourceQuestionId_fkey" FOREIGN KEY ("sourceQuestionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
