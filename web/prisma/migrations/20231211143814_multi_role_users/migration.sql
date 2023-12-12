/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "roles" "Role"[];

UPDATE "User" SET "roles" = ARRAY["role"];

ALTER TABLE "User" DROP COLUMN "role";
