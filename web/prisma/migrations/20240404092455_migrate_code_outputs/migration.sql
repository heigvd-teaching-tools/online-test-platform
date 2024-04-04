-- This is an empty migration.UPDATE TestCaseResult
UPDATE "TestCase"
SET "expectedOutput" = "expectedOutput" || E'\n'
WHERE RIGHT("expectedOutput", 1) != E'\n';


UPDATE "TestCaseResult"
SET "expectedOutput" = "expectedOutput" || E'\n'
WHERE RIGHT("expectedOutput", 1) != E'\n';