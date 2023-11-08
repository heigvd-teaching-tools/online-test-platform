-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "scope" TEXT;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- This is a simplified version and might need to be adjusted based on your specific requirements and SQL dialect
UPDATE "Group"
SET "scope" = regexp_replace(
                lower(unaccent("label")), -- This function removes accents, requires the unaccent extension
                '[^\w]+',          -- Regex to match one or more non-word characters
                '-',               -- Replacement string (dash)
                'g'                -- Global replacement
              );

-- Then trim any trailing dashes that might have been added by the replacement
UPDATE "Group"
SET "scope" = regexp_replace("scope", '-$', '', 'g');
