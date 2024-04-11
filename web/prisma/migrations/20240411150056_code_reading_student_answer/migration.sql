-- CreateTable
CREATE TABLE "StudentAnswerCodeReading" (
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "StudentAnswerCodeReading_pkey" PRIMARY KEY ("userEmail","questionId")
);

-- CreateTable
CREATE TABLE "StudentAnswerCodeReadingOutput" (
    "questionId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "snippetId" TEXT NOT NULL,
    "output" TEXT,

    CONSTRAINT "StudentAnswerCodeReadingOutput_pkey" PRIMARY KEY ("questionId","userEmail","snippetId")
);

-- AddForeignKey
ALTER TABLE "StudentAnswerCodeReading" ADD CONSTRAINT "StudentAnswerCodeReading_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswerCode"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerCodeReadingOutput" ADD CONSTRAINT "StudentAnswerCodeReadingOutput_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "CodeReadingSnippet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerCodeReadingOutput" ADD CONSTRAINT "StudentAnswerCodeReadingOutput_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswerCodeReading"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;
