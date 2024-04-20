-- CreateEnum
CREATE TYPE "StudentAnswerCodeReadingOutputStatus" AS ENUM ('NEUTRAL', 'MATCH', 'MISMATCH');

-- AlterTable
ALTER TABLE "StudentAnswerCodeReadingOutput" ADD COLUMN     "status" "StudentAnswerCodeReadingOutputStatus" NOT NULL DEFAULT 'NEUTRAL';
