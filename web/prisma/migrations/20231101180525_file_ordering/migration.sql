-- AlterTable
ALTER TABLE "CodeToSolutionFile" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CodeToTemplateFile" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- Part 1: Update CodeToSolutionFile order based on questionId and the creation date of the linked file
WITH OrderedSolutions AS (
    SELECT
        ctsf."questionId",
        ctsf."fileId",
        ROW_NUMBER() OVER (PARTITION BY ctsf."questionId" ORDER BY f."createdAt" ASC) - 1 AS "new_order"
    FROM
        "CodeToSolutionFile" ctsf
        INNER JOIN "File" f ON ctsf."fileId" = f."id"
)
UPDATE "CodeToSolutionFile"
SET
    "order" = os."new_order"
FROM
    OrderedSolutions os
WHERE
    "CodeToSolutionFile"."questionId" = os."questionId" AND
    "CodeToSolutionFile"."fileId" = os."fileId";

-- Part 2: Update CodeToTemplateFile order based on the order of the corresponding CodeToSolutionFile with the same questionId and File.path
WITH TemplateOrderUpdates AS (
    SELECT
        cttf."questionId",
        cttf."fileId",
        ctsf."order" AS "new_order"
    FROM
        "CodeToTemplateFile" cttf
        INNER JOIN "File" ft ON cttf."fileId" = ft."id"
        INNER JOIN "File" fs ON ft."path" = fs."path"
        INNER JOIN "CodeToSolutionFile" ctsf ON cttf."questionId" = ctsf."questionId" AND fs."id" = ctsf."fileId"
)
UPDATE "CodeToTemplateFile"
SET
    "order" = tou."new_order"
FROM
    TemplateOrderUpdates tou
WHERE
    "CodeToTemplateFile"."questionId" = tou."questionId" AND
    "CodeToTemplateFile"."fileId" = tou."fileId";

