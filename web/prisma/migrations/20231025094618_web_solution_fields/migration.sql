/*
  Warnings:

  - You are about to drop the column `css` on the `Web` table. All the data in the column will be lost.
  - You are about to drop the column `html` on the `Web` table. All the data in the column will be lost.
  - You are about to drop the column `js` on the `Web` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Web" RENAME COLUMN "html" TO "solutionHtml";
ALTER TABLE "Web" RENAME COLUMN "css" TO "solutionCss";
ALTER TABLE "Web" RENAME COLUMN "js" TO "solutionJs";
