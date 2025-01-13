-- AlterTable
ALTER TABLE "Group" ADD COLUMN "organization" TEXT;

-- AlterTable
ALTER TABLE "User" 
ADD COLUMN "affiliations" TEXT[], 
ADD COLUMN "organizations" TEXT[], 
ADD COLUMN "selectedOrganization" TEXT;

-- Update "Group" table with the organization value
UPDATE "Group"
SET "organization" = (
    SELECT split_part("email", '@', 2) -- Extract the domain from the creator's email
    FROM "User"
    WHERE "User"."id" = "Group"."createdById"
)
WHERE "Group"."createdById" IS NOT NULL;

-- Update "User" table with affiliations, organizations, and selectedOrganization
UPDATE "User"
SET 
    affiliations = ARRAY["User"."email"],
    organizations = ARRAY[split_part("User"."email", '@', 2)]
WHERE EXISTS (
    SELECT 1 
    FROM "Account"
    WHERE "Account"."userId" = "User"."id"
    AND "Account"."provider" = 'keycloak'
);
