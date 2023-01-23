import axios from "axios";
import tar from "tar";
import uniqid from "uniqid"; 
import fs from "fs";

// mode = run / test

export const runSandbox = (code, solution = "", mode = "run") => {
    return new Promise((resolve, reject) => {
        let runUniqId = uniqid();
        // prepare the file to execute
        fs.mkdirSync(`sandbox/runs/node/${runUniqId}`);
        fs.mkdirSync(`sandbox/runs/node/${runUniqId}/image`);

        fs.writeFileSync(`sandbox/runs/node/${runUniqId}/image/code.js`, code);
        fs.writeFileSync(`sandbox/runs/node/${runUniqId}/image/solution.js`, solution);
        
        fs.copyFile(`sandbox/environements/node/Dockerfile`, `sandbox/runs/node/${runUniqId}/image/Dockerfile`, async function(err) {
            fs.copyFile(`sandbox/environements/node/entrypoint.sh`, `sandbox/runs/node/${runUniqId}/image/entrypoint.sh`, async function(err) {
                tar.c({ gzip: true, cwd: `sandbox/runs/node/${runUniqId}/image` }, ["./"])
                .pipe(fs.createWriteStream(`sandbox/runs/node/${runUniqId}/image.tar.gz`))
                .on("finish", async () => {
                    let contentFromFile = fs.readFileSync(`sandbox/runs/node/${runUniqId}/image.tar.gz`);
                    await axios({
                        method: 'post',
                        url: `http://localhost:2375/build?q=true&t=sandbox:img-${runUniqId}&buildargs={"mode":"${mode}"}`,
                        data: contentFromFile,
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    })
                    .then(async () => {
                        
                        let { data: { Id: containerId }} = await axios.post(`http://localhost:2375/containers/create?name=run-${runUniqId}`, { Image: `sandbox:img-${runUniqId}` });

                        await axios.post(`http://localhost:2375/containers/${containerId}/start`);

                        let { data: logData } = await axios.get(`http://localhost:2375/containers/${containerId}/logs?stderr=1&stdout=1&follow=1&tail=0`);
                        
                        await axios.delete(`http://localhost:2375/containers/${containerId}?force=true`);
                        await axios.delete(`http://localhost:2375/images/sandbox:img-${runUniqId}?force=true`);
                        resolve(logData.substring(8, logData.length - 1).replaceAll(/\n.{8}/g, "\n"));
                    })
                    .catch(({message}) => {
                        reject(message);
                        return;
                    });

                    fs.rmSync(`sandbox/runs/node/${runUniqId}`, { recursive: true, force: true });
                });
            });
        });
    });
}