import { GenericContainer, Wait } from "testcontainers";
import {DatabaseQueryOutputType, DatabaseQueryOutputStatus, DatabaseQueryOutputTest} from "@prisma/client";
import pkg from 'pg';
const { Client } = pkg;

const generateFeedbackMessage = (command, result) => {
    const { rowCount } = result;

    const message = `${command} operation executed.`;
    if (rowCount) {
        return `${message} ${rowCount} row${rowCount > 1 ? "s" : ""} affected.`;
    }

    if(command === "SELECT") { // for SELECT queries, we display the number of rows returned even if it is 0
        return `${message} ${rowCount} row${rowCount > 1 ? "s" : ""} returned.`;
    }

    return message;
}

/*
    enum DatabaseQueryOutputType {
      TABULAR
      SCALAR
      TEXT
    }

* */

const determineOutputType = (result) => {
    const rowCount = result.rowCount;
    const fieldCount = result.fields.length;

    if (fieldCount > 1 || fieldCount === 1 && rowCount > 1) {
        return DatabaseQueryOutputType.TABULAR;
    }

    if (fieldCount === 1 && rowCount === 1) {
        return DatabaseQueryOutputType.SCALAR;
    }

    return DatabaseQueryOutputType.TEXT;
}

const OutputTestFlags = {
    [DatabaseQueryOutputTest.MATCH_OUTPUT]: 1 << 0,             // 0001
    [DatabaseQueryOutputTest.IGNORE_COLUMN_ORDER]: 1 << 1,     // 0010
    [DatabaseQueryOutputTest.IGNORE_ROW_ORDER]: 1 << 2,        // 0100
};

const deepEqual = (a, b) => {
    if (a === b) return true;

    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();

    if (typeof a !== 'object' || typeof b !== 'object') return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (let key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
}

const arraysEqualIgnoreRowOrder = (a, b) => {
    if (!deepEqual(a.metadata, b.metadata)) return false;

    if (a.data.length !== b.data.length) return false;

    const unusedIndexes = new Set([...Array(b.data.length).keys()]);

    for (const row1 of a.data) {
        let isRowMatched = false;

        for (const index of unusedIndexes) {
            if (deepEqual(row1, b.data[index])) {
                unusedIndexes.delete(index);
                isRowMatched = true;
                break;
            }
        }

        if (!isRowMatched) return false;
    }

    return true;
}

const arraysEqualIgnoreColumnOrder = (a, b) => {
    if (!deepEqual(a.metadata, b.metadata)) return false;

    if (a.data.length !== b.data.length) return false;

    const columnOrder1 = Object.keys(a.metadata.columns);
    const columnOrder2 = Object.keys(b.metadata.columns);

    for (let i = 0; i < a.data.length; i++) {
        const row1 = a.data[i].reduce((acc, value, index) => {
            acc[columnOrder1[index]] = value;
            return acc;
        }, {});

        const row2 = b.data[i].reduce((acc, value, index) => {
            acc[columnOrder2[index]] = value;
            return acc;
        }, {});

        if (!deepEqual(row1, row2)) return false;
    }

    return true;
}

const testDatabaseOutput = (output, expectedOutput, testFlags) => {
    let results = {
        passedTests: [],
        failedTests: []
    };

    if (testFlags & OutputTestFlags[DatabaseQueryOutputTest.MATCH_OUTPUT]) {
        if (JSON.stringify(output) === JSON.stringify(expectedOutput)) {
            results.passedTests.push(DatabaseQueryOutputTest.MATCH_OUTPUT);
        } else {
            results.failedTests.push(DatabaseQueryOutputTest.MATCH_OUTPUT);
        }
    }

    if (testFlags & OutputTestFlags[DatabaseQueryOutputTest.IGNORE_COLUMN_ORDER]) {
        if (arraysEqualIgnoreColumnOrder(output, expectedOutput)) {
            results.passedTests.push(DatabaseQueryOutputTest.IGNORE_COLUMN_ORDER);
        } else {
            results.failedTests.push(DatabaseQueryOutputTest.IGNORE_COLUMN_ORDER);
        }
    }

    if (testFlags & OutputTestFlags[DatabaseQueryOutputTest.IGNORE_ROW_ORDER]) {
        if (arraysEqualIgnoreRowOrder(output, expectedOutput)) {
            results.passedTests.push(DatabaseQueryOutputTest.IGNORE_ROW_ORDER);
        } else {
            results.failedTests.push(DatabaseQueryOutputTest.IGNORE_ROW_ORDER);
        }
    }

    return results;
}


/*
    PostgreSQL output to dataset
    Used to transform the output of a PostgreSQL query to a dataset that can be used for testing
* */
const pgOutputToToDataset = (pgData) => {
    const dataset = {
        columns: [],
        rows: []
    };

    // dataTypeID to actual types for PostgreSQL
    const dataTypeMapping = {
        23: 'integer',
        1043: 'text'
    };

    // Transform fields to columns in metadata
    dataset.columns = pgData.fields.map((field) => {
        return {
            name: field.name,
            type: dataTypeMapping[field.dataTypeID] || field.format
        };
    });


    // Transform rows
    for (const row of pgData.rows) {
        const dataRow = [];
        for (const column of dataset.columns) {
            dataRow.push(row[column.name]);
        }
        dataset.rows.push(dataRow);
    }

    return dataset;
}

const testQueryTests = async (client) => {
    /*
    // test ignore column order
    const dataset1 =  pgOutputToToDataset(await client.query("SELECT customer_id, last_name, first_name FROM customer LIMIT 20;"));
    const dataset2 =  pgOutputToToDataset(await client.query("SELECT customer_id, first_name, last_name FROM customer LIMIT 20;"));

    const testFlags = OutputTestFlags[DatabaseQueryOutputTest.MATCH_OUTPUT] | OutputTestFlags[DatabaseQueryOutputTest.IGNORE_COLUMN_ORDER];

    const testColOrderIgnore = testDatabaseOutput(dataset1, dataset2, testFlags);

    console.log("testColOrderIgnore", testColOrderIgnore);

    // test ignore row order
    const dataset3 =  pgOutputToToDataset(await client.query("SELECT customer_id, last_name, first_name FROM customer;"));
    const dataset4 =  pgOutputToToDataset(await client.query("SELECT customer_id, last_name, first_name FROM customer ORDER BY customer_id DESC;"));

    const testFlags2 = OutputTestFlags[DatabaseQueryOutputTest.MATCH_OUTPUT] | OutputTestFlags[DatabaseQueryOutputTest.IGNORE_ROW_ORDER];

    const testRowOrderIgnore = testDatabaseOutput(dataset3, dataset4, testFlags2);

    console.log("testRowOrderIgnore", testRowOrderIgnore);

    // test match output
    const dataset5 =  pgOutputToToDataset(await client.query("SELECT customer_id, last_name, first_name FROM customer;"));
    const dataset6 =  pgOutputToToDataset(await client.query("SELECT customer_id, last_name, first_name FROM customer;"));

    const testFlags3 = OutputTestFlags[DatabaseQueryOutputTest.MATCH_OUTPUT];

    const testMatchOutput = testDatabaseOutput(dataset5, dataset6, testFlags3);

    console.log("testMatchOutput", testMatchOutput);
*/
    // test match output with different column order and different row order

    const dataset7 =  pgOutputToToDataset(await client.query("SELECT customer_id, last_name, first_name FROM customer;"));
    const dataset8 =  pgOutputToToDataset(await client.query("SELECT first_name, last_name, customer_id FROM customer ORDER BY customer_id DESC;"));

    const testFlags4 = OutputTestFlags[DatabaseQueryOutputTest.MATCH_OUTPUT] | OutputTestFlags[DatabaseQueryOutputTest.IGNORE_ROW_ORDER];

    const testMatchOutput2 = testDatabaseOutput(dataset7, dataset8, testFlags4);

    console.log("testMatchOutput2", testMatchOutput2);


}


export const runSandboxDB = async ({
   image = "postgres:latest",
   databaseConfig = {
       database: "postgres",
       user: "postgres",
       password: "postgres",
   },
   queries = [],
}) => {
    const results = [];
    let container;
    let client;

    console.log("MATCH_OUTPUT flag", OutputTestFlags[DatabaseQueryOutputTest.MATCH_OUTPUT])
    console.log("IGNORE_COLUMN_ORDER flag", OutputTestFlags[DatabaseQueryOutputTest.IGNORE_COLUMN_ORDER])
    console.log("IGNORE_ROW_ORDER flag", OutputTestFlags[DatabaseQueryOutputTest.IGNORE_ROW_ORDER])

    try {
        container = await new GenericContainer(image)
            .withExposedPorts(5432)
            .withWaitStrategy(Wait.forLogMessage("database system is ready to accept connections"))
            .start();

        client = new Client({
            host: "localhost",
            port: container.getFirstMappedPort(),
            ...databaseConfig,
        });

        await client.connect();

        // await testQueryTests(client);

        for (let query of queries) {
            try {
                const result = await client.query(query);
                const dataset = pgOutputToToDataset(result);
                results.push({
                    status: DatabaseQueryOutputStatus.SUCCESS,
                    feedback: generateFeedbackMessage(result.command, result),
                    type: determineOutputType(result),
                    result: dataset
                });
            } catch (error) {
                results.push({
                    status: DatabaseQueryOutputStatus.ERROR,
                    feedback: error.message,
                    type: DatabaseQueryOutputType.TEXT,
                    result: error
                });
                break;  // Stop executing further queries if one fails
            }
        }

    } catch (error) {
        // General error handling for the container setup or connection
        results.push({
            status: DatabaseQueryOutputStatus.ERROR,
            feedback: error.message,
            type: DatabaseQueryOutputType.TEXT,
            result: error
        });
    } finally {
        if (client) await client.end();
        if (container) await container.stop();
    }

    return results;
}



