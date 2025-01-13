-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "organization" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "affiliations" TEXT[],
ADD COLUMN     "organizations" TEXT[],
ADD COLUMN     "selectedOrganization" TEXT;


UPDATE "Group"
SET "organization" = (
    SELECT split_part("email", '@', 2) -- Extract the domain from the creator's email
    FROM "User"
    WHERE "User"."id" = "Group"."createdById"
)
WHERE "Group"."createdById" IS NOT NULL;