BEGIN;

-- Drop the codeType column from Code and StudentAnswerCode tables
ALTER TABLE "Code" DROP COLUMN "codeType";
ALTER TABLE "StudentAnswerCode" DROP COLUMN "codeType";

-- Drop the existing enum (make sure no other tables use this enum)
DROP TYPE IF EXISTS "CodeQuestionType";

COMMIT;
BEGIN;

-- Create the new enum
CREATE TYPE "CodeQuestionType" AS ENUM ('codeWriting', 'codeReading');

-- Add the codeType column back to Code and StudentAnswerCode tables with a default value
ALTER TABLE "Code" ADD COLUMN "codeType" "CodeQuestionType" NOT NULL DEFAULT 'codeWriting';
ALTER TABLE "StudentAnswerCode" ADD COLUMN "codeType" "CodeQuestionType" NOT NULL DEFAULT 'codeWriting';

COMMIT;
