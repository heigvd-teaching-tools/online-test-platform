-- CreateEnum
CREATE TYPE "AnnotationEntityType" AS ENUM ('CODE_WRITING_FILE');

-- AlterTable
ALTER TABLE "Annotation" ADD COLUMN     "entityType" "AnnotationEntityType" NOT NULL DEFAULT 'CODE_WRITING_FILE';
