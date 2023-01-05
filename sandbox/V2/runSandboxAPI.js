import axios from "axios";
import tar from "tar";
import uniqid from "uniqid"; 
import fs from "fs";

// mode = run / test

const runPath = "./runs/node/api";
const envPath = "./environements/node";

export const runSandbox = (code, tests, mode = "run") => {
    return new Promise((resolve, reject) => {
        let runUniqId = uniqid();
        // prepare the file to execute
        fs.mkdirSync(`${runPath}/${runUniqId}`);
        fs.mkdirSync(`${runPath}/${runUniqId}/image`);

        fs.writeFileSync(`${runPath}/${runUniqId}/image/code.js`, code);

        const testsString = tests.map(({ input }) => {
            return input + "\n";
        }).join("");

        fs.writeFileSync(`${runPath}/${runUniqId}/image/tests.txt`, testsString);
        
        fs.copyFile(`${envPath}/Dockerfile`, `${runPath}/${runUniqId}/image/Dockerfile`, async function(err) {
            fs.copyFile(`${envPath}/entrypoint.sh`, `${runPath}/${runUniqId}/image/entrypoint.sh`, async function(err) {
                tar.c({ gzip: true, cwd: `${runPath}/${runUniqId}/image` }, ["./"])
                .pipe(fs.createWriteStream(`${runPath}/${runUniqId}/image.tar.gz`))
                .on("finish", async () => {
                    let imageContent = fs.readFileSync(`${runPath}/${runUniqId}/image.tar.gz`);
                    await axios({
                        method: 'post',
                        url: `http://localhost:2375/build?q=true&t=sandbox:img-${runUniqId}&buildargs={"mode":"${mode}"}`,
                        data: imageContent,
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    })
                    .then(async () => {
                        
                        let { Id: containerId } = await startContainer(`sandbox:img-${runUniqId}`, `run-${runUniqId}`);
                        
                        let response = await attachToContainer(containerId);

                        
                        //await axios.delete(`http://localhost:2375/containers/${containerId}?force=true`);
                        //await axios.delete(`http://localhost:2375/images/sandbox:img-${runUniqId}?force=true`);
                        // resolve(logData.substring(8, logData.length - 1).replaceAll(/\n.{8}/g, "\n"));
                       

                        


                    })
                    .catch(({message}) => {
                        reject(message);
                        return;
                    });

//                    fs.rmSync(`${runPath}/${runUniqId}`, { recursive: true, force: true });
                });
            });
        });
    });
}

async function attachToContainer(containerId) {
    try {
        const response = await axios.post(
            `http://localhost:2375/containers/${containerId}/attach`, {
                stream: true,
                stdin: true,
                stdout: true,
                stderr: true
            },{
                headers: { 'Content-Type': 'application/vnd.docker.raw-stream' },
                responseType: 'stream'
            });

        return response;
    } catch (error) {
        console.error("ATTACH ERROR", error);
    }
}

async function startContainer(image, name) {
    try {
        const response = await axios.post(`http://localhost:2375/containers/create?name=${name}`, {
            Image: image,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true
        });
      
        const { Id: containerId } = response.data;
        await axios.post(`http://localhost:2375/containers/${containerId}/start`);

    return response.data;

    } catch (error) {
      console.error("START ERROR", error);
    }
  }