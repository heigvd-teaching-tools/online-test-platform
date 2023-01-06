import uniqid from "uniqid"; 
import fs from "fs";

import { GenericContainer } from "testcontainers";
//import { GenericContainer } from "../../testcontainers-node";

// mode = run / test
// https://www.npmjs.com/package/testcontainers
// https://github.com/apocas/dockerode

const EXECUTION_TIMEOUT = 5000;

export const runSandboxNode = (code, tests, mode = "run") => {
    return new Promise(async (resolve, reject) =>  {
        
        /* ## CONTENT CREATE */

        // Create the files
        let directory = `runs/node/tc/${uniqid()}`;
        fs.mkdirSync(directory);

        const testsString = tests.map(({ input }) => {
            return input + "\n";
        }).join("");

        const expectedString = tests.map(({ output }) => {
            return output + "\n";
        }).join("");

        
        fs.writeFileSync(`${directory}/code.js`, code || "");
        fs.writeFileSync(`${directory}/tests.txt`, testsString || "");


        /* ## CONTAINER  */
        // Prepare the container
        const container = await new GenericContainer("node:current-alpine3.16")
            .withEnvironment(
                "NODE_NO_WARNINGS", "1"
            )
            .withCopyFilesToContainer([{
               source: `${directory}/code.js`,
               target: "/app/code.js"
            },{
               source: `${directory}/tests.txt`,
               target: "/app/tests.txt"
            }])
            .withCommand(["sleep", "infinity"])
            .start();

        /* ## CONTENT DELETE */

        // Delete the files
        fs.rmSync(directory, { recursive: true, force: true });

        /* ## TIMEOUT  */
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

        /* ## EXECUTION  */

        // Execute the code
        let { output:result } = await container.exec([
            "sh", "-c", "node /app/code.js < /app/tests.txt"
        ], { tty: false });

        clearTimeout(timeout);

        if(containerStarted) { // If no timeout
            // Stop the container
            await container.stop();
        }
        

        // remove first 8 bytes ( 4 bytes for length and 4 bytes for stream )
        result = result.slice(8);
               

        // Prepare output based on mode
        if(!response){ // If no timeout
            if (mode === "run") {
                // Send the result
                response = {
                    fn: resolve,
                    arg: result
                };
            } else if (mode === "test") {
                // test run
                response = {
                    fn: resolve,
                    arg: {
                        success: result === expectedString,
                        expected: expectedString,
                        result: result,
                    }
                };
            }
        }
        response.fn(response.arg);
    });
}

export const runSandboxJava = (code, tests, mode = "run") => {
    return new Promise(async (resolve, reject) =>  {
        
        /* ## CONTENT CREATE */

        // Create the files
        let directory = `runs/java/tc/${uniqid()}`;
        fs.mkdirSync(directory);

        tests.map(({ input }, index) => {
            fs.writeFileSync(`${directory}/test${index}.txt`, input || "");
        }).join("");

        const expectedString = tests.map(({ output }) => {
            return output + "\n";
        }).join("");

        fs.writeFileSync(`${directory}/Main.java`, code || "");

        /* ## CONTAINER  */

        // Prepare the container
        const container = await new GenericContainer("openjdk:16-alpine")
            .withEnvironment(
                "NODE_NO_WARNINGS", "1"
            )
            .withCopyFilesToContainer([{
                source: `${directory}/Main.java`,
                target: "/app/Main.java"
            },
            ...tests.map((_, index) => {
                return {
                    source: `${directory}/test${index}.txt`,
                    target: `/app/test${index}.txt`
                }
            })
            ])
            .withCommand(["sleep", "infinity"])
            .start();

        /* ## CONTENT DELETE */
        fs.rmSync(directory, { recursive: true, force: true });

         /* ## TIMEOUT  */
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

        /* ## EXECUTION  */

        let results = []

        
        for (let index = 0; index < tests.length; index++) {

            // Execute the code
            let { output:result } = await container.exec([
                "sh", "-c", "javac /app/Main.java && java -cp /app Main < /app/test"+index+".txt"
            ], { tty: false });

            // check if first by is \x01
            if(result[0] === "\x01"){
                result = result.slice(8);
            }

            let t = result.split("\n").map((line) => {
                if(line[0] === "\x01"){
                    return line.slice(8);
                }
                return line;
            });

            result = t.join("\n");
                



            results.push(result);

        };
        
       
        
        clearTimeout(timeout);

        if(containerStarted) { // If no timeout
            // Stop the container
            await container.stop();
        }

        let result = results.join("");

        // Prepare output based on mode
        if(!response){ // If no timeout
            if (mode === "run") {
                // Send the result
                response = {
                    fn: resolve,
                    arg: result
                };
            } else if (mode === "test") {
                // test run
                response = {
                    fn: resolve,
                    arg: {
                        success: result === expectedString,
                        expected: expectedString,
                        result: result,
                    }
                };
            }
        }
        response.fn(response.arg);

 

    });
}
