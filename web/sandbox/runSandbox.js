import uniqid from "uniqid"; 
import fs from "fs";
import { GenericContainer, Wait } from "../../testcontainers-node";
//import { GenericContainer, Wait } from "testcontainers";

// mode = run / test
// https://www.npmjs.com/package/testcontainers
// https://github.com/apocas/dockerode

const EXECUTION_TIMEOUT = 30000;

export const runSandbox = (code = "", solution = "", mode = "run") => {
    return new Promise(async (resolve, reject) =>  {
        
        // Create the files
        let directory = `sandbox/runs/${uniqid()}`;
        fs.mkdirSync(directory);
        fs.writeFileSync(`${directory}/code.js`, code);
        fs.writeFileSync(`${directory}/solution.js`, solution);

        // Prepare the container
        const container = await new GenericContainer("node:current-alpine3.16")
            .withEnv("NODE_NO_WARNINGS", "1")
            .withCopyFileToContainer(`${directory}/code.js`, "/app/code.js")
            .withCopyFileToContainer(`${directory}/solution.js`, "/app/solution.js")
            .withCmd(["sleep", "infinity"])
            .start();



        let containerStarted = true;
        let response = undefined;
        // Stop the container after 30 seconds
        let timeout = setTimeout(() => {
            containerStarted = false;
            container.stop();
            if (mode === "run") {
                response = {
                    fn: reject,
                    arg: "Execution timed out",
                };
            } else {
                response = {
                    fn: resolve,
                    arg: {
                        success: false,
                        expected: "N/A",
                        result: "Timeout"
                    },
                };
            }
        }, EXECUTION_TIMEOUT);

        // Execute the code
        //const { output:expected2, exitCode:exitCodeExpected2 } = await container.exec(["node", "/app/solution.js", "2>&1"]);
        const { output:expected, exitCode:exitCodeExpected } = await container.exec([
            "node", "/app/solution.js"
        ], { tty: false });
        //const { output:result, exitCode:exitCodeResult } = await container.exec(["node", "/app/code.js", "2>&1"]);
        const { output:result, exitCode:exitCodeResult } = await container.exec([
            "node", "/app/code.js"
        ], { tty: false });

        clearTimeout(timeout);

        if(containerStarted) { // If no timeout
            // Stop the container
            await container.stop();
        }

        // Delete the files
        fs.rmSync(directory, { recursive: true, force: true });

        // Prepare output based on mode
        if(!response){ // If no timeout
            if (mode === "run") {
                // Send the result
                response = {
                    fn: resolve,
                    arg: cleanString(result)
                };
            } else if (mode === "test") {
                // test run
                response = {
                    fn: resolve,
                    arg: {
                        success: result === expected,
                        expected: cleanString(expected),
                        result: cleanString(result),
                    }
                };
            }
        }
        response.fn(response.arg);
    });
}

// when running tests in ( tty : false ) mode the output contains some invalid characters
const cleanString = (input) => {
    var output = "";
    for (var i=0; i<input.length; i++) {
        let charCode = input.charCodeAt(i);
        if (charCode >= 8 && charCode <= 126) {
            output += input.charAt(i);
        }
    }
    return output;
}