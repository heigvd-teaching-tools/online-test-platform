import { GenericContainer, Wait } from "testcontainers";
import { DatabaseQueryOutputType } from "@prisma/client";
import pkg from 'pg';
const { Client } = pkg;

const QueryStatus = {
    SUCCESS: "SUCCESS",
    WARNING: "WARNING",
    ERROR: "ERROR",
    RUNNING: "RUNNING", // used in frontend
};


const generateFeedbackMessage = (command, result) => {
    const { rowCount } = result;

    const message = `${command} operation executed.`;
    if (rowCount) {
        return `${message} ${rowCount} row${rowCount > 1 ? "s" : ""} affected.`;
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

        for (let query of queries) {
            try {
                const result = await client.query(query);
                results.push({
                    status: QueryStatus.SUCCESS,
                    feedback: generateFeedbackMessage(result.command, result),
                    type: determineOutputType(result),
                    result: {
                        command: result.command,
                        rowCount: result.rowCount,
                        oid: result.oid,
                        rows: result.rows,
                        fields: result.fields,
                    },

                });
            } catch (error) {
                results.push({
                    status: QueryStatus.ERROR,
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
            status: 'ERROR',
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



