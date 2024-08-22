-- Step 1: Add the new column to the table
ALTER TABLE "Evaluation" 
ADD COLUMN "durationActive" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Update existing records based on durationHours and durationMins
UPDATE "Evaluation" 
SET "durationActive" = true 
WHERE "durationHours" > 0 OR "durationMins" > 0;
