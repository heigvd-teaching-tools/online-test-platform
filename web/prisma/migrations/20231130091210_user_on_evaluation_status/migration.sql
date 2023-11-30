-- CreateEnum
CREATE TYPE "UserOnEvaluationStatus" AS ENUM ('IN_PROGRESS', 'FINISHED');

-- AlterTable
ALTER TABLE "UserOnEvaluation" ADD COLUMN     "status" "UserOnEvaluationStatus" NOT NULL DEFAULT 'IN_PROGRESS';
ALTER TABLE "UserOnEvaluation" ADD COLUMN     "finishedAt" TIMESTAMP(3);

UPDATE "UserOnEvaluation"
SET 
    status = CASE 
        WHEN e.phase = 'IN_PROGRESS' THEN 'IN_PROGRESS'
        WHEN e.phase = 'FINISHED' THEN 'FINISHED'
        ELSE "UserOnEvaluation".status
    END,
    "finishedAt" = CASE
        WHEN e.phase = 'FINISHED' THEN e."updatedAt"
        ELSE NULL
    END
FROM "Evaluation" e
WHERE "UserOnEvaluation"."evaluationId" = e.id;
