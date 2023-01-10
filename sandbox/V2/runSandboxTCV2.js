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
    image = 'node:latest',
    files = [], // { name, content }
    compile = undefined,
    tests = [], // { exec, input, output }
}) => {
    return new Promise(async (resolve, reject) =>  {
        const directory = prepareContent(files, tests);

        const container = await startContainer(image, directory, compile);

        /* ## TIMEOUT  */
        let containerStarted = true;
        let response = undefined;
        let timeout = prepareTimeout(() => {
            container.stop();
            containerStarted = false;
        });

        let result = await execCode(container, tests);

        clearTimeout(timeout);

        if(containerStarted) { // If no timeout
            // Stop the container
            await container.stop();
        }else{
            reject("Execution timed out");
        }

        let output = prepareOutput(response, result, tests);

        resolve(output);
    
    });
}

const prepareContent = (files, tests) => {
    let codeDirectory = `runs/tc/${uniqid()}`;
    fs.mkdirSync(codeDirectory, { recursive: true });

    tests.map(({ input }, index) => {
        fs.writeFileSync(`${codeDirectory}/test${index}.txt`, input || "");
    });

    files.map(({ path, content }) => {
        let filesDirectory = `${codeDirectory}/${path.split("/").slice(0, -1).join("/")}`;
        let fileName = path.split("/").slice(-1)[0];

        fs.mkdirSync(filesDirectory, { recursive: true });

        fs.writeFileSync(`${filesDirectory}/${fileName}`, content || "");
    });

    return codeDirectory;
}

const startContainer = async (image, filesDirectory, compile) => {

    const files = fs.readdirSync(filesDirectory).map((file) => ({
        source: `${filesDirectory}/${file}`,
        destination: `/app/${file}`,
    }));
    
    let container = await (
        new GenericContainer(image)
            .withEnvironment(
                "NODE_NO_WARNINGS", "1"
            )
            .withCopyFilesToContainer(files)
            .withCommand(["sleep", "infinity"])
            .start()
    );

    if(compile){
        await container.exec(compile, { tty: false });
    }

    /* ## CONTENT DELETE */
    fs.rmSync(filesDirectory, { recursive: true, force: true });

    return container;
}

const prepareTimeout = (timeoutCallback) => setTimeout(() => timeoutCallback("Execution timed out"), EXECUTION_TIMEOUT);


const execCode = async (container, tests) => {
    let results = []

    for (let index = 0; index < tests.length; index++) {
        let { exec, input } = tests[index];
        let result = await container.exec(
            ["sh", "-c", exec, "<", `/app/test${index}.txt`],
            { tty: false });
        results.push(result);
    };

    return cleanResponseHeaders(results.join(""));

}

const prepareOutput = (response, result, tests) => {

    if(!response){ // If no timeout
        const expectedString = tests.map(({ output }) => {
            return output + "\n";
        }).join("");

        return {
            success: result === expectedString,
            expected: expectedString,
            result: result,
        };
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
