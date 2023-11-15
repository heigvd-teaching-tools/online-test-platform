-- Step 1: Create New Tables

-- CreateEnum
CREATE TYPE "EvaluationPhase" AS ENUM ('NEW', 'DRAFT', 'IN_PROGRESS', 'GRADING', 'FINISHED');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- Evaluation table
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "conditions" TEXT,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'ACTIVE',
    "phase" "EvaluationPhase" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "durationHours" INTEGER DEFAULT 0,
    "durationMins" INTEGER DEFAULT 0,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "groupId" TEXT NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- EvaluationToQuestion table
CREATE TABLE "EvaluationToQuestion" (
    "evaluationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EvaluationToQuestion_pkey" PRIMARY KEY ("evaluationId","questionId")
);

-- UserOnEvaluation table
CREATE TABLE "UserOnEvaluation" (
    "userEmail" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserOnEvaluation_pkey" PRIMARY KEY ("userEmail","evaluationId")
);



-- Step 2: Copy Data from Old Tables to New Tables
-- Copy data to Evaluation
INSERT INTO "Evaluation" ("id", "label", "conditions", "status", "phase", "createdAt", "updatedAt", "durationHours", "durationMins", "startAt", "endAt", "groupId")
SELECT 
    "id", 
    "label", 
    "conditions", 
    CASE 
        WHEN "status" = 'ACTIVE' THEN 'ACTIVE'::"EvaluationStatus"
        ELSE 'ARCHIVED'::"EvaluationStatus"
    END,
    CASE 
        WHEN "phase" = 'NEW' THEN 'NEW'::"EvaluationPhase"
        WHEN "phase" = 'DRAFT' THEN 'DRAFT'::"EvaluationPhase"
        WHEN "phase" = 'IN_PROGRESS' THEN 'IN_PROGRESS'::"EvaluationPhase"
        WHEN "phase" = 'GRADING' THEN 'GRADING'::"EvaluationPhase"
        ELSE 'FINISHED'::"EvaluationPhase"
    END, 
    "createdAt", 
    "updatedAt", 
    "durationHours", 
    "durationMins", 
    "startAt", 
    "endAt", 
    "groupId"
FROM "JamSession";


-- Copy data to EvaluationToQuestion
INSERT INTO "EvaluationToQuestion" ("evaluationId", "questionId", "points", "order")
SELECT "jamSessionId" AS "evaluationId", "questionId", "points", "order"
FROM "JamSessionToQuestion";

-- Copy data to UserOnEvaluation
INSERT INTO "UserOnEvaluation" ("userEmail", "evaluationId", "registeredAt", "score")
SELECT "userEmail", "jamSessionId" AS "evaluationId", "registeredAt", "score"
FROM "UserOnJamSession";


-- Step 3: Test number of rows
-- Test for Evaluation table
DO $$
DECLARE 
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM "JamSession";
    SELECT COUNT(*) INTO new_count FROM "Evaluation";
    IF old_count != new_count THEN 
        RAISE EXCEPTION 'Row count mismatch in Evaluation table. Old: %, New: %', old_count, new_count;
    END IF;
    -- Add more tests as necessary, such as comparing sums of numeric fields or checking specific records
END $$;

-- Similar test for EvaluationToQuestion
DO $$
DECLARE 
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM "JamSessionToQuestion";
    SELECT COUNT(*) INTO new_count FROM "EvaluationToQuestion";
    IF old_count != new_count THEN 
        RAISE EXCEPTION 'Row count mismatch in EvaluationToQuestion table. Old: %, New: %', old_count, new_count;
    END IF;
    -- Additional tests
END $$;

-- Similar test for UserOnEvaluation
DO $$
DECLARE 
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM "UserOnJamSession";
    SELECT COUNT(*) INTO new_count FROM "UserOnEvaluation";
    IF old_count != new_count THEN 
        RAISE EXCEPTION 'Row count mismatch in UserOnEvaluation table. Old: %, New: %', old_count, new_count;
    END IF;
    -- Additional tests
END $$;


-- Step 4: Drop Old Tables (after confirming that new tables are functioning correctly)


DROP TABLE "JamSessionToQuestion";
DROP TABLE "UserOnJamSession";
DROP TABLE "JamSession";

DROP TYPE "JamSessionPhase";
DROP TYPE "JamSessionStatus";


-- Step 5: Clean Up
-- (Remove any references to the old tables from your application code)

-- Step 6: Database Integrity
-- (Add any additional foreign key constraints or indexes as needed on the new tables)

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_groupId_label_key" ON "Evaluation"("groupId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationToQuestion_questionId_key" ON "EvaluationToQuestion"("questionId");

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationToQuestion" ADD CONSTRAINT "EvaluationToQuestion_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationToQuestion" ADD CONSTRAINT "EvaluationToQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnEvaluation" ADD CONSTRAINT "UserOnEvaluation_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnEvaluation" ADD CONSTRAINT "UserOnEvaluation_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;








