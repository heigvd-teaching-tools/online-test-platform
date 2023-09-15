import {GenericContainer, Wait} from "testcontainers";
import {DatabaseQueryOutputStatus, DatabaseQueryOutputType} from "@prisma/client";
import pkg from 'pg';
import {
    postgresDetermineOutputType,
    postgresGenerateFeedbackMessage,
    postgresOutputToToDataset,
} from "../code/database";

const { Client } = pkg;

export const runSandboxDB = async ({
   image = "postgres:latest",
   databaseConfig = {
       database: "postgres",
       user: "postgres",
       password: "postgres",
   },
   queries = [], // string[]
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
            host: process.env.DB_SANDBOX_CLIENT_HOST || "localhost",
            port: container.getFirstMappedPort(),
            ...databaseConfig,
        });

        await client.connect();

        let order = 1;
        for (const query of queries) {
            try {
                const result = await client.query(query);
                const dataset = postgresOutputToToDataset(result);
                const type = postgresDetermineOutputType(result)
                const feedback = postgresGenerateFeedbackMessage(result.command, result)
                results.push({
                    order: order++,
                    status: DatabaseQueryOutputStatus.SUCCESS,
                    feedback: feedback,
                    type: type,
                    result: type === DatabaseQueryOutputType.TEXT ? feedback : dataset,
                });
            } catch (error) {
                results.push({
                    order: order,
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



