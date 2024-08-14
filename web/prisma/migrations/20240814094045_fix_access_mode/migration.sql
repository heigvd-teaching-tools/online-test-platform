UPDATE "Evaluation"
SET "accessMode" = 'LINK_AND_ACCESS_LIST'
WHERE jsonb_array_length("accessList"::jsonb) > 0;
