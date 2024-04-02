-- AddForeignKey
ALTER TABLE "UserOnEvaluationDeniedAccessAttempt" ADD CONSTRAINT "UserOnEvaluationDeniedAccessAttempt_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
