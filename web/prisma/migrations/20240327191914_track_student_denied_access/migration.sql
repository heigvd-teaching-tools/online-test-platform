-- CreateTable
CREATE TABLE "UserOnEvaluationDeniedAccessAttempt" (
    "userEmail" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOnEvaluationDeniedAccessAttempt_pkey" PRIMARY KEY ("userEmail","evaluationId")
);

-- AddForeignKey
ALTER TABLE "UserOnEvaluationDeniedAccessAttempt" ADD CONSTRAINT "UserOnEvaluationDeniedAccessAttempt_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
