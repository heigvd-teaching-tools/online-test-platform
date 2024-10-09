-- AlterTable
ALTER TABLE "UserOnEvaluation" ADD COLUMN     "hasSessionChanged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalSessionToken" TEXT,
ADD COLUMN     "sessionChangeDetectedAt" TIMESTAMP(3);
