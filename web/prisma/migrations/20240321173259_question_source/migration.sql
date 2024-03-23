BEGIN;

-- Step 1: Create the QuestionSource ENUM
CREATE TYPE "QuestionSource" AS ENUM ('ORIGINAL', 'COPY');

-- Step 2: Alter the Question table to include the new fields
ALTER TABLE "Question" 
ADD COLUMN "source" "QuestionSource" NOT NULL DEFAULT 'ORIGINAL',
ADD COLUMN "sourceQuestionId" TEXT;

-- Step 3: Add a foreign key constraint for sourceQuestionId referencing the Question table
ALTER TABLE "Question" ADD CONSTRAINT "Question_sourceQuestionId_fkey" FOREIGN KEY ("sourceQuestionId") REFERENCES "Question"("id") ON DELETE SET NULL;

-- Step 4: Set source to COPY for questions that are associated with an evaluation
UPDATE "Question" 
SET "source" = 'COPY'
WHERE id IN (
    SELECT DISTINCT "questionId" 
    FROM "EvaluationToQuestion"
);

-- Step 5: BEST EFFORT: Set sourceQuestionId to the original question id for questions that are associated with an evaluation
-- Update the sourceQuestionId of questions that are part of the evaluation by searching the question with the same title and content not being part of any evaluation
UPDATE "Question" q1
SET "sourceQuestionId" = (
    SELECT q2."id"
    FROM "Question" q2
    WHERE q2."title" = q1."title"
    AND q2."content" = q1."content"
    AND q2."id" NOT IN (
        SELECT "questionId"
        FROM "EvaluationToQuestion"
    )
    AND q1."id" IN (
        SELECT "questionId"
        FROM "EvaluationToQuestion"
    )
    LIMIT 1
)
WHERE q1."id" IN (
    SELECT "questionId"
    FROM "EvaluationToQuestion"
);



COMMIT;
