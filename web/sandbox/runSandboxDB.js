import { GenericContainer, Wait } from "testcontainers";
import Docker from 'dockerode';
import {DatabaseQueryOutputStatus, DatabaseQueryOutputType} from "@prisma/client";
import pkg from 'pg';
import {
    postgresDetermineOutputType,
    postgresGenerateFeedbackMessage,
    postgresOutputToToDataset,
} from "../code/database";

const { Client } = pkg;

const docker = new Docker();

const imageExists = async (name) => {
    const images = await docker.listImages({filters: {reference: [name]}});
    return images.length > 0;
}

const pullImage = async (name) => {
    return new Promise((resolve, reject) => {
        docker.pull(name, {}, (err, stream) => {
            if (err) return reject(err);
            docker.modem.followProgress(stream, (error, output) => {
                if (error) reject(error);
                resolve(output);
            });
        });
    });
}

const pullImageIfNotExists = async (image) => {
    try {
        // Check if the image exists locally
        const exists = await imageExists(image);
        if (exists) {
            return { status: true, wasExisting: true, message: "Image already exists" };
        }

        // Pull the image if it's not available locally
        await pullImage(image);
        return { status: true, wasExisting: false,  message: "Image pulled successfully" };
    } catch (error) {
        console.error("Error pulling image:", error);
        return { status: false, message: `Error pulling image: ${error.message}` };
    }
}

const startContainer = async (image) => {
    const container = await new GenericContainer(image)
        .withExposedPorts(5432)
        .withWaitStrategy(Wait.forLogMessage("database system is ready to accept connections"))
        .start();
    return container;
}

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

    // First try to start the container, then pull the image if it doesn't exist
    // This approach is used to avoid sending check requests to the docker daemon unnecessarily on each run 
    try {
        container = await startContainer(image);
    } catch (initialError) {
        // Check if the error is related to the image not being present
        if (initialError.message.includes("No such image")) {
            const { status, message } = await pullImageIfNotExists(image);
            if (!status) {
                return [{
                    status: DatabaseQueryOutputStatus.ERROR,
                    feedback: message,
                    type: DatabaseQueryOutputType.TEXT,
                    result: message,
                }];
            }
            
            // Try to start the container again
            try {
                container = await startContainer(image);
            } catch (secondError) {
                return [{
                    status: DatabaseQueryOutputStatus.ERROR,
                    feedback: `Error after pulling image: ${secondError.message}`,
                    type: DatabaseQueryOutputType.TEXT,
                    result: `Error after pulling image: ${secondError.message}`,
                }];
            }
        } else {
            // Handle other errors when starting the container
            return [{
                status: DatabaseQueryOutputStatus.ERROR,
                feedback: `Container start error: ${initialError.message}`,
                type: DatabaseQueryOutputType.TEXT,
                result: `Container start error: ${initialError.message}`,
            }];
        }
    }  

    // Container is running, try to connect to it and execute the queries
    try{

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
            feedback: "Database Container or Client connection error",
            type: DatabaseQueryOutputType.TEXT,
            result: "Database Container or Client connection error"
        });
    } finally {
        if (client) await client.end();
        if (container) await container.stop();
    }

    return results;
}



