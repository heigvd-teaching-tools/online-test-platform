import uniqid from "uniqid"; 
import fs from "fs";
import Docker  from "dockerode";
import tar from "tar-stream";


//import { GenericContainer } from "../../testcontainers-node";

// mode = run / test
// https://www.npmjs.com/package/testcontainers
// https://github.com/apocas/dockerode

const EXECUTION_TIMEOUT = 5000;

const runPath = "./runs/node/testcontainers";

export const runSandbox = (code, solution, mode = "run") => {
    return new Promise(async (resolve, reject) =>  {
        
        const docker = new Docker();

        await docker.pull("node:current-alpine3.16");

        // Create the files
        let directory = `${runPath}/${uniqid()}`;
        fs.mkdirSync(directory);
        fs.writeFileSync(`${directory}/code.js`, code || "");
        fs.writeFileSync(`${directory}/solution.js`, solution || "");

        // Create a container using the image
        const container = await docker.createContainer({
            Image: "node:current-alpine3.16",
            Tty: true,
        });

        // Start the container
        await container.start();

        // extract code.js from the container
        await container.exec({
            Cmd: ['mkdir', '-p', 'sandbox']
        });

          
        const pack = tar.pack();

        // add the files to the tar stream
        pack.entry({ name: 'code.js' }, fs.readFileSync(`${directory}/code.js`));
        pack.entry({ name: 'solution.js' }, fs.readFileSync(`${directory}/solution.js`));
        
        pack.finalize();

        // copy code.js into the container
        await container.putArchive(pack, { 
            path: "/app/code.tar" 
        });

        // extract code.js from the container
        await container.exec({
            Cmd: ['tar', '-xvf', '/app/code.tar'],
            AttachStdout: true,
            AttachStderr: true,
        });

        
        // Execute the Node.js script in the container
        const exec = await container.exec({
            Cmd: ['node', '/app/code.js'],
            Tty: true,
        });

        // Get the stream for the exec instance
        const stream = await exec.start({
            hijack: true,
        });

        // Send input to the console
        stream.write('input1\n');
        stream.write('input2\n');

        // Close the stream
        stream.end();



        
       console.log("hello");
    });
}

// when running tests in ( tty : false ) mode the output contains some invalid characters
const cleanString = (input) => {
    let output = "";
    for (let i=0; i<input.length; i++) {
        let charCode = input.charCodeAt(i);
        if (isLegalCharCode(charCode)) {
            output += input.charAt(i);
        }
    }
    return output;
}

// tab, linebreak, space, numbers, letters, punctuation
const isLegalCharCode = (charCode) => (charCode === 9 || charCode === 10 || charCode === 13 || (charCode >= 32 && charCode <= 126));

// used only for comparison between expected and result
// removed tab and enter
const cleanForComparison = (input) => {
    let output = "";
    for (let i=0; i<input.length; i++) {
        let charCode = input.charCodeAt(i);
        if (charCode !== 9 && charCode !== 10 && charCode !== 13) {
            output += input.charAt(i);
        }
    }
    return output;
}