import uniqid from "uniqid"; 
import fs from "fs";
const { GenericContainer } = require("testcontainers");


// mode = run / test
export const runSandbox = (code, solution = "", mode = "run") => {
    return new Promise(async (resolve, reject) =>  {
        
        // Create the files
        let directory = `sandbox/runs/${uniqid()}`;
        fs.mkdirSync(directory);
        fs.writeFileSync(`${directory}/code.js`, code);
        fs.writeFileSync(`${directory}/solution.js`, solution);

        // Prepare the container
        const container = await new GenericContainer("node:current-alpine3.16")
            .withCopyFileToContainer(`${directory}/code.js`, "/app/code.js")
            .withCopyFileToContainer(`${directory}/solution.js`, "/app/solution.js")
            .withCmd(["sleep", "infinity"])
            .start();

        // Execute the code
        const { output:result } = await container.exec(["node", "/app/code.js"]);
        const { output:expected } = await container.exec(["node", "/app/solution.js"]);
        
        // Prepare output based on mode
        let output;
        if (mode === "run") {
            // simple run
            output = result;
        } else if (mode === "test") {
            // test run
            output = {
                success: result === expected,
                expected: expected,
                result: result,
            };
        }

        // Stop the container
        await container.stop();

        // Delete the files
        fs.rmSync(directory, { recursive: true, force: true });

        // Send the result
        resolve(output);
    });
}