import uniqid from "uniqid"; 
import fs from "fs";

import { GenericContainer } from "testcontainers";
//import { GenericContainer } from "../../testcontainers-node";

// mode = run / test
// https://www.npmjs.com/package/testcontainers
// https://github.com/apocas/dockerode

const IMAGES = {
    "js": "node:latest",
    "py": "python:latest",
    "java": "openjdk:latest",
    "cpp": "gcc:latest"
}

const EXEC_COMMANDS = {
    "js": (fileName, testIndex) => ["sh", "-c", `node /app/${fileName}.js < /app/test${testIndex}.txt`],
    "py": (fileName, testIndex) => ["sh", "-c", `python3 /app/${fileName}.py < /app/test${testIndex}.txt`],
    "java": (fileName, testIndex) => ["sh", "-c", `javac /app/${fileName}.java && java -cp /app ${fileName} < /app/test${testIndex}.txt`],
    "cpp": (fileName, testIndex) => ["sh", "-c", `g++ /app/${fileName}.cpp -o /app/${fileName} && /app/${fileName} < /app/test${testIndex}.txt`]
}

const EXECUTION_TIMEOUT = 30000;


export const runSandbox = ({ 
    language = 'js', // also used as file extention
    code = '',
    tests = [],
    mode = 'run'
}) => {
    return new Promise(async (resolve, reject) =>  {

        let directory = prepareContent(language, code, tests);

        let container = await startContainer(directory, language, tests);

        /* ## TIMEOUT  */
        let containerStarted = true;
        let response = undefined;
        let timeout = prepareTimeout(() => {
            container.stop();
            containerStarted = false;
        });

        let result = await execCode(container, language, tests, mode);

        clearTimeout(timeout);

        if(containerStarted) { // If no timeout
            // Stop the container
            await container.stop();
        }else{
            reject("Execution timed out");
        }

        let output = prepareOutput(response, mode, result, tests);
        
        resolve(output);
    });
}


const prepareContent = (language, code, tests = []) => {
    let directory = `runs/${language}/tc/${uniqid()}`;
    fs.mkdirSync(directory);

    tests.map(({ input }, index) => {
        fs.writeFileSync(`${directory}/test${index}.txt`, input || "");
    }).join("");

    fs.writeFileSync(`${directory}/Main.${language}`, code || "");

    return directory;
}

const startContainer = async (directory, extention, tests) => {
    
    let container = await (
        new GenericContainer(IMAGES[extention])
            .withEnvironment(
                "NODE_NO_WARNINGS", "1"
            )
            .withCopyFilesToContainer([{
                source: `${directory}/Main.${extention}`,
                target: `/app/Main.${extention}`
            },
            ...tests.map((_, index) => {
                return {
                    source: `${directory}/test${index}.txt`,
                    target: `/app/test${index}.txt`
                }
            })
            ])
            .withCommand(["sleep", "infinity"])
            .start()
    );

        /* ## CONTENT DELETE */
        fs.rmSync(directory, { recursive: true, force: true });

        return container;
}

const prepareTimeout = (timeoutCallback) => {
     // Stop the container after 30 seconds
    return setTimeout(() => {
        timeoutCallback("Execution timed out");   
    }, EXECUTION_TIMEOUT);
}


const execCode = async (container, language, tests, mode) => {
    let results = []

    for (let index = 0; index < tests.length; index++) {
        let { output:result } = await container.exec(
            EXEC_COMMANDS[language](`Main`, index),
            { tty: false }
        );
        results.push(result);
    };

    return cleanResponseHeaders(results.join(""));

}

const prepareOutput = (response, mode, result, tests) => {

    if(!response){ // If no timeout

        switch(mode){
            case "run":
                return result;
            case "test":

                const expectedString = tests.map(({ output }) => {
                    return output + "\n";
                }).join("");

                return {
                    success: result === expectedString,
                    expected: expectedString,
                    result: result,
                }
            }
    }

    return response;
}


            

const cleanResponseHeaders = (input) => {
    /*
        The response contains some headers that we need to remove
        \x01 -> response comes from stdout 
        \x02 -> response comes from stderr
        and the first 8 bytes are the length of the message
    */
    // find \x01 or \x02 and remove the next 8 bytes
    /*
        tried with regexp : input.replaceAll(/(\x01|\x02).{8}/gm, '')
        but it didnt not work
    */

    let output = '';

    for (let i = 0; i < input.length; i++) {
        if (input[i] !== '\x01' && input[i] !== '\x02') {
            output += input[i];
        } else {
            i += 7;
        }
    }

    return output;
}
