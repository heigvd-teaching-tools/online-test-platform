-- CreateEnum
CREATE TYPE "StudentPermission" AS ENUM ('UPDATE', 'VIEW', 'HIDDEN');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'PROFESSOR');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('multipleChoice', 'trueFalse', 'essay', 'code', 'web', 'database');

-- CreateEnum
CREATE TYPE "DatabaseQueryOutputType" AS ENUM ('TABULAR', 'SCALAR', 'TEXT');

-- CreateEnum
CREATE TYPE "DatabaseQueryOutputStatus" AS ENUM ('SUCCESS', 'ERROR', 'WARNING', 'RUNNING', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "DatabaseDBMS" AS ENUM ('POSTGRES', 'MYSQL', 'MARIADB', 'MSSQL', 'SQLITE');

-- CreateEnum
CREATE TYPE "DatabaseQueryOutputTest" AS ENUM ('IGNORE_COLUMN_ORDER', 'IGNORE_ROW_ORDER', 'IGNORE_EXTRA_COLUMNS', 'INGORE_COLUMN_TYPES');

-- CreateEnum
CREATE TYPE "EvaluationPhase" AS ENUM ('NEW', 'DRAFT', 'IN_PROGRESS', 'GRADING', 'FINISHED');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StudentAnswerStatus" AS ENUM ('MISSING', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "StudentQuestionGradingStatus" AS ENUM ('UNGRADED', 'GRADED', 'AUTOGRADED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOnGroup" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserOnGroup_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionToQuestion" (
    "collectionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "CollectionToQuestion_pkey" PRIMARY KEY ("collectionId","questionId")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultipleChoice" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "MultipleChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "multipleChoiceId" TEXT NOT NULL,
    "text" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrueFalse" (
    "questionId" TEXT NOT NULL,
    "isTrue" BOOLEAN,

    CONSTRAINT "TrueFalse_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "Essay" (
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Essay_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "SandBox" (
    "image" TEXT NOT NULL,
    "beforeAll" TEXT,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "SandBox_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "index" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    "exec" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("index","questionId")
);

-- CreateTable
CREATE TABLE "Code" (
    "questionId" TEXT NOT NULL,
    "language" TEXT,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "Database" (
    "questionId" TEXT NOT NULL,
    "image" TEXT DEFAULT '',

    CONSTRAINT "Database_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "DatabaseToSolutionQuery" (
    "questionId" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "outputId" TEXT,

    CONSTRAINT "DatabaseToSolutionQuery_pkey" PRIMARY KEY ("questionId","queryId")
);

-- CreateTable
CREATE TABLE "DatabaseQuery" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "questionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "lintActive" BOOLEAN NOT NULL DEFAULT false,
    "lintRules" TEXT,
    "lintResult" JSONB,
    "content" TEXT,
    "template" TEXT,
    "studentPermission" "StudentPermission" NOT NULL DEFAULT 'UPDATE',
    "testQuery" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DatabaseQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAnswerDatabaseToQuery" (
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "studentOutputId" TEXT,
    "solutionOutputId" TEXT,

    CONSTRAINT "StudentAnswerDatabaseToQuery_pkey" PRIMARY KEY ("userEmail","questionId","queryId")
);

-- CreateTable
CREATE TABLE "StudentAnswerCodeToFile" (
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "studentPermission" "StudentPermission" NOT NULL DEFAULT 'UPDATE',

    CONSTRAINT "StudentAnswerCodeToFile_pkey" PRIMARY KEY ("userEmail","questionId","fileId")
);

-- CreateTable
CREATE TABLE "DatabaseQueryOutput" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "output" JSONB NOT NULL,
    "status" "DatabaseQueryOutputStatus" NOT NULL DEFAULT 'RUNNING',
    "type" "DatabaseQueryOutputType" NOT NULL DEFAULT 'TEXT',
    "dbms" "DatabaseDBMS" NOT NULL DEFAULT 'POSTGRES',
    "queryId" TEXT NOT NULL,

    CONSTRAINT "DatabaseQueryOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatabaseQueryToOutputTest" (
    "queryId" TEXT NOT NULL,
    "test" "DatabaseQueryOutputTest" NOT NULL,

    CONSTRAINT "DatabaseQueryToOutputTest_pkey" PRIMARY KEY ("queryId","test")
);

-- CreateTable
CREATE TABLE "CodeToSolutionFile" (
    "questionId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "CodeToSolutionFile_pkey" PRIMARY KEY ("questionId","fileId")
);

-- CreateTable
CREATE TABLE "CodeToTemplateFile" (
    "questionId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "studentPermission" "StudentPermission" NOT NULL DEFAULT 'UPDATE',

    CONSTRAINT "CodeToTemplateFile_pkey" PRIMARY KEY ("questionId","fileId")
);

-- CreateTable
CREATE TABLE "Web" (
    "questionId" TEXT NOT NULL,
    "html" TEXT,
    "css" TEXT,
    "js" TEXT,

    CONSTRAINT "Web_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("label")
);

-- CreateTable
CREATE TABLE "QuestionToTag" (
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "QuestionToTag_pkey" PRIMARY KEY ("questionId","label")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "EvaluationToQuestion" (
    "evaluationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EvaluationToQuestion_pkey" PRIMARY KEY ("evaluationId","questionId")
);

-- CreateTable
CREATE TABLE "UserOnEvaluation" (
    "userEmail" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserOnEvaluation_pkey" PRIMARY KEY ("userEmail","evaluationId")
);

-- CreateTable
CREATE TABLE "StudentAnswer" (
    "questionId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "status" "StudentAnswerStatus" NOT NULL DEFAULT 'MISSING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAnswer_pkey" PRIMARY KEY ("userEmail","questionId")
);

-- CreateTable
CREATE TABLE "StudentQuestionGrading" (
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StudentQuestionGradingStatus" NOT NULL DEFAULT 'UNGRADED',
    "pointsObtained" INTEGER NOT NULL DEFAULT 0,
    "signedByUserEmail" TEXT,
    "comment" TEXT,

    CONSTRAINT "StudentQuestionGrading_pkey" PRIMARY KEY ("userEmail","questionId")
);

-- CreateTable
CREATE TABLE "StudentAnswerMultipleChoice" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "StudentAnswerMultipleChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAnswerTrueFalse" (
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "isTrue" BOOLEAN,

    CONSTRAINT "StudentAnswerTrueFalse_pkey" PRIMARY KEY ("userEmail","questionId")
);

-- CreateTable
CREATE TABLE "StudentAnswerEssay" (
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "content" TEXT,

    CONSTRAINT "StudentAnswerEssay_pkey" PRIMARY KEY ("userEmail","questionId")
);

-- CreateTable
CREATE TABLE "StudentAnswerCode" (
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "allTestCasesPassed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StudentAnswerCode_pkey" PRIMARY KEY ("userEmail","questionId")
);

-- CreateTable
CREATE TABLE "StudentAnswerDatabase" (
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "StudentAnswerDatabase_pkey" PRIMARY KEY ("userEmail","questionId")
);

-- CreateTable
CREATE TABLE "TestCaseResult" (
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "exec" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,

    CONSTRAINT "TestCaseResult_pkey" PRIMARY KEY ("index","userEmail","questionId")
);

-- CreateTable
CREATE TABLE "StudentAnswerWeb" (
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "html" TEXT,
    "css" TEXT,
    "js" TEXT,

    CONSTRAINT "StudentAnswerWeb_pkey" PRIMARY KEY ("userEmail","questionId")
);

-- CreateTable
CREATE TABLE "StudentAnswerCodeHistory" (
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT,

    CONSTRAINT "StudentAnswerCodeHistory_pkey" PRIMARY KEY ("userEmail","questionId","createdAt")
);

-- CreateTable
CREATE TABLE "_OptionToStudentAnswerMultipleChoice" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Group_label_key" ON "Group"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_label_key" ON "Collection"("label");

-- CreateIndex
CREATE UNIQUE INDEX "MultipleChoice_questionId_key" ON "MultipleChoice"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "SandBox_questionId_key" ON "SandBox"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "DatabaseToSolutionQuery_queryId_key" ON "DatabaseToSolutionQuery"("queryId");

-- CreateIndex
CREATE UNIQUE INDEX "DatabaseToSolutionQuery_outputId_key" ON "DatabaseToSolutionQuery"("outputId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAnswerDatabaseToQuery_queryId_key" ON "StudentAnswerDatabaseToQuery"("queryId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAnswerDatabaseToQuery_studentOutputId_key" ON "StudentAnswerDatabaseToQuery"("studentOutputId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAnswerDatabaseToQuery_solutionOutputId_key" ON "StudentAnswerDatabaseToQuery"("solutionOutputId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAnswerCodeToFile_fileId_key" ON "StudentAnswerCodeToFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeToSolutionFile_fileId_key" ON "CodeToSolutionFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeToTemplateFile_fileId_key" ON "CodeToTemplateFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_label_key" ON "Tag"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_label_key" ON "Evaluation"("label");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationToQuestion_questionId_key" ON "EvaluationToQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAnswerMultipleChoice_userEmail_questionId_key" ON "StudentAnswerMultipleChoice"("userEmail", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "_OptionToStudentAnswerMultipleChoice_AB_unique" ON "_OptionToStudentAnswerMultipleChoice"("A", "B");

-- CreateIndex
CREATE INDEX "_OptionToStudentAnswerMultipleChoice_B_index" ON "_OptionToStudentAnswerMultipleChoice"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnGroup" ADD CONSTRAINT "UserOnGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnGroup" ADD CONSTRAINT "UserOnGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionToQuestion" ADD CONSTRAINT "CollectionToQuestion_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionToQuestion" ADD CONSTRAINT "CollectionToQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultipleChoice" ADD CONSTRAINT "MultipleChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_multipleChoiceId_fkey" FOREIGN KEY ("multipleChoiceId") REFERENCES "MultipleChoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrueFalse" ADD CONSTRAINT "TrueFalse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Essay" ADD CONSTRAINT "Essay_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SandBox" ADD CONSTRAINT "SandBox_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Code"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Code"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Database" ADD CONSTRAINT "Database_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatabaseToSolutionQuery" ADD CONSTRAINT "DatabaseToSolutionQuery_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Database"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatabaseToSolutionQuery" ADD CONSTRAINT "DatabaseToSolutionQuery_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "DatabaseQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatabaseToSolutionQuery" ADD CONSTRAINT "DatabaseToSolutionQuery_outputId_fkey" FOREIGN KEY ("outputId") REFERENCES "DatabaseQueryOutput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatabaseQuery" ADD CONSTRAINT "DatabaseQuery_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Database"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Code"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerDatabaseToQuery" ADD CONSTRAINT "StudentAnswerDatabaseToQuery_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswerDatabase"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerDatabaseToQuery" ADD CONSTRAINT "StudentAnswerDatabaseToQuery_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "DatabaseQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerDatabaseToQuery" ADD CONSTRAINT "StudentAnswerDatabaseToQuery_studentOutputId_fkey" FOREIGN KEY ("studentOutputId") REFERENCES "DatabaseQueryOutput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerCodeToFile" ADD CONSTRAINT "StudentAnswerCodeToFile_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswerCode"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerCodeToFile" ADD CONSTRAINT "StudentAnswerCodeToFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatabaseQueryOutput" ADD CONSTRAINT "DatabaseQueryOutput_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "DatabaseQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatabaseQueryToOutputTest" ADD CONSTRAINT "DatabaseQueryToOutputTest_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "DatabaseQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeToSolutionFile" ADD CONSTRAINT "CodeToSolutionFile_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Code"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeToSolutionFile" ADD CONSTRAINT "CodeToSolutionFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeToTemplateFile" ADD CONSTRAINT "CodeToTemplateFile_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Code"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeToTemplateFile" ADD CONSTRAINT "CodeToTemplateFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Web" ADD CONSTRAINT "Web_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionToTag" ADD CONSTRAINT "QuestionToTag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionToTag" ADD CONSTRAINT "QuestionToTag_label_fkey" FOREIGN KEY ("label") REFERENCES "Tag"("label") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationToQuestion" ADD CONSTRAINT "EvaluationToQuestion_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationToQuestion" ADD CONSTRAINT "EvaluationToQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnEvaluation" ADD CONSTRAINT "UserOnEvaluation_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnEvaluation" ADD CONSTRAINT "UserOnEvaluation_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentQuestionGrading" ADD CONSTRAINT "StudentQuestionGrading_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswer"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentQuestionGrading" ADD CONSTRAINT "StudentQuestionGrading_signedByUserEmail_fkey" FOREIGN KEY ("signedByUserEmail") REFERENCES "User"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerMultipleChoice" ADD CONSTRAINT "StudentAnswerMultipleChoice_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswer"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerTrueFalse" ADD CONSTRAINT "StudentAnswerTrueFalse_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswer"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerEssay" ADD CONSTRAINT "StudentAnswerEssay_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswer"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerCode" ADD CONSTRAINT "StudentAnswerCode_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswer"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerDatabase" ADD CONSTRAINT "StudentAnswerDatabase_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswer"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCaseResult" ADD CONSTRAINT "TestCaseResult_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswerCode"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswerWeb" ADD CONSTRAINT "StudentAnswerWeb_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswer"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OptionToStudentAnswerMultipleChoice" ADD CONSTRAINT "_OptionToStudentAnswerMultipleChoice_A_fkey" FOREIGN KEY ("A") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OptionToStudentAnswerMultipleChoice" ADD CONSTRAINT "_OptionToStudentAnswerMultipleChoice_B_fkey" FOREIGN KEY ("B") REFERENCES "StudentAnswerMultipleChoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
