/*
  Warnings:

  - The values [NEW,DRAFT] on the enum `EvaluationPhase` will be removed. If these variants are still used in the database, this will fail.
*/

-- Start Migration
BEGIN;

-- Step 1: Update existing data to use only values that will remain valid after the migration
-- Update 'DRAFT' to 'SETTINGS' while the old enum is still in place
UPDATE "Evaluation"
SET "phase" = 'NEW'  -- Temporarily change to an existing valid value
WHERE "phase" = 'DRAFT';

-- Step 2: Create the new enum type
CREATE TYPE "EvaluationPhase_new" AS ENUM ('NEW', 'SETTINGS', 'COMPOSITION', 'REGISTRATION', 'IN_PROGRESS', 'GRADING', 'FINISHED');

-- Step 3: Alter the table to use the new enum type
ALTER TABLE "Evaluation" ALTER COLUMN "phase" DROP DEFAULT;
ALTER TABLE "Evaluation" ALTER COLUMN "phase" TYPE "EvaluationPhase_new" USING ("phase"::text::"EvaluationPhase_new");

-- Step 4: Update the temporarily changed values to the correct new enum values
UPDATE "Evaluation"
SET "phase" = 'SETTINGS'
WHERE "phase" = 'NEW' AND "phase"::text NOT IN ('REGISTRATION', 'GRADING', 'FINISHED', 'COMPOSITION');

-- Reverting other IN_PROGRESS updates back to 'REGISTRATION' or the correct phase
UPDATE "Evaluation"
SET "phase" = 'REGISTRATION'
WHERE "phase" = 'NEW' AND "phase"::text NOT IN ('GRADING', 'FINISHED', 'SETTINGS', 'COMPOSITION');

-- Step 5: Rename old enum type and set the new one
ALTER TYPE "EvaluationPhase" RENAME TO "EvaluationPhase_old";
ALTER TYPE "EvaluationPhase_new" RENAME TO "EvaluationPhase";
DROP TYPE "EvaluationPhase_old";

-- Step 6: Set the default value for the column
ALTER TABLE "Evaluation" ALTER COLUMN "phase" SET DEFAULT 'SETTINGS';

COMMIT;

-- Optional: Ensure the default is set for future rows
ALTER TABLE "Evaluation" ALTER COLUMN "phase" SET DEFAULT 'SETTINGS';
