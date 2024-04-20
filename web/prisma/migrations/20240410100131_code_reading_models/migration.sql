-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_questionId_fkey";

-- CreateTable
CREATE TABLE "CodeReading" (
    "questionId" TEXT NOT NULL,

    CONSTRAINT "CodeReading_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "CodeReadingSnippet" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "snippet" TEXT,
    "output" TEXT,

    CONSTRAINT "CodeReadingSnippet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CodeReading" ADD CONSTRAINT "CodeReading_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Code"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReadingSnippet" ADD CONSTRAINT "CodeReadingSnippet_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CodeReading"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CodeWriting"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;
