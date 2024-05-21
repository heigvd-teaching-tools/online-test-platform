
  -- Drop the existing foreign key constraint in the Option table
  ALTER TABLE "Option" DROP CONSTRAINT "Option_multipleChoiceId_fkey";

  -- Drop the existing unique index on questionId in the MultipleChoice table
  DROP INDEX IF EXISTS "MultipleChoice_questionId_key";

  -- Alter the MultipleChoice table to drop the primary key constraint, drop the id column, and add a new primary key constraint on questionId
  ALTER TABLE "MultipleChoice" DROP CONSTRAINT "MultipleChoice_pkey",
  ADD CONSTRAINT "MultipleChoice_pkey" PRIMARY KEY ("questionId");

  -- Add a new column questionId to the Option table as nullable
  ALTER TABLE "Option" ADD COLUMN "questionId" TEXT;

  -- Copy data from the related MultipleChoice's questionId to the new questionId column in the Option table
  UPDATE "Option" o
  SET "questionId" = mc."questionId"
  FROM "MultipleChoice" mc
  WHERE o."multipleChoiceId" = mc."id";

  ALTER TABLE "MultipleChoice" DROP COLUMN "id";

  -- Verify that all questionId values in the Option table have been populated
  DO $$ 
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM "Option"
      WHERE "questionId" IS NULL
    ) THEN
      RAISE EXCEPTION 'Data integrity violation: Some questionId values in the Option table are still NULL after update';
    END IF;
  END $$;

  -- Alter the column questionId to be NOT NULL
  ALTER TABLE "Option" ALTER COLUMN "questionId" SET NOT NULL;

  -- Drop the multipleChoiceId column from the Option table
  ALTER TABLE "Option" DROP COLUMN "multipleChoiceId";

  -- Add a new foreign key constraint in the Option table
  ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MultipleChoice"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;
