DO $$
DECLARE
    collId VARCHAR; -- Variable to store each collection ID
BEGIN
    FOR collId IN
        SELECT DISTINCT "collectionId"
        FROM "CollectionToQuestion"
        WHERE ("collectionId", "order") IN (
            SELECT "collectionId", "order"
            FROM "CollectionToQuestion"
            GROUP BY "collectionId", "order"
            HAVING COUNT(*) > 1
        )
    LOOP
        -- Temporary table to hold new order values
        CREATE TEMP TABLE TempOrder (id VARCHAR, new_order INT);

        -- Populate temporary table with new order values, starting at 0
        INSERT INTO TempOrder (id, new_order)
        SELECT "questionId", ROW_NUMBER() OVER (ORDER BY "order") - 1 
        FROM "CollectionToQuestion"
        WHERE "collectionId" = collId;

        -- Update the "CollectionToQuestion" table with new order values from the temporary table
        UPDATE "CollectionToQuestion"
        SET "order" = TempOrder.new_order
        FROM TempOrder
        WHERE "CollectionToQuestion"."questionId" = TempOrder.id AND "CollectionToQuestion"."collectionId" = collId;

        -- Drop the temporary table
        DROP TABLE TempOrder;
    END LOOP;
END $$;
