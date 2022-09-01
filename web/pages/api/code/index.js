import axios from "axios";
import tar from "tar";
import uniqid from "uniqid"; 
import fs from "fs";
//  tar zcvf dockerfile.tar.gz .

const runSandbox = (codeContent) => {
    return new Promise((resolve, reject) => {
        let runUniqId = uniqid();
        // prepare the file to execute
        fs.mkdirSync(`sandbox/runs/node/${runUniqId}`);
        fs.mkdirSync(`sandbox/runs/node/${runUniqId}/image`);

        fs.writeFileSync(`sandbox/runs/node/${runUniqId}/image/run.js`, codeContent);
        
        fs.copyFile(`sandbox/environements/node/Dockerfile`, `sandbox/runs/node/${runUniqId}/image/Dockerfile`, async function(err) {
            fs.copyFile(`sandbox/environements/node/entrypoint.sh`, `sandbox/runs/node/${runUniqId}/image/entrypoint.sh`, async function(err) {
                tar.c({ gzip: true, cwd: `sandbox/runs/node/${runUniqId}/image` }, ["./"])
                .pipe(fs.createWriteStream(`sandbox/runs/node/${runUniqId}/image.tar.gz`))
                .on("finish", async () => {
                    let contentFromFile = fs.readFileSync(`sandbox/runs/node/${runUniqId}/image.tar.gz`);
                    await axios({
                        method: 'post',
                        url: `http://localhost:2375/build?q=true&t=sandbox:img-${runUniqId}&buildargs={"file_name":"run.js"}`,
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

export default async function handler(req, res) {

    let { code } = req.body;

    await runSandbox(code).then((reponse) => {
        res.status(200).send(reponse);
    }).catch(error => {
        console.error(error);
        res.status(500).send(error);
        return;
    });
}
    /*
async function handler2(req, res) {
    let runUniqId = `${uniqid()}`;

    /*
        Run the docker sandbox dind ("Docker in Docker")
        docker run --privileged --name sandbox-docker docker:dind

        Copy sandbox environement docker files to the sandbox docker
        docker cp ./sandbox sandbox-docker:/
    
    
    // prepare the file to execute
    fs.writeFile(`sandbox/node/runs/run-${runUniqId}.js`, codeContent, function(err) {
            if(err) {
                res.status(500).send(err);
                return console.log(err);
            }
        
            // build an image of the environement including the file to execute
            exec(`docker exec sandbox-docker docker build -q ./sandbox/node --build-arg "file_name=run-${runUniqId}.js" --tag sandbox:img-${runUniqId}`, function (error, imageId, stderr) {
                if(error) {
                    res.status(500).send(error);
                    return console.log(error);
                }
                // run the image in sandbox docker
                exec(`docker exec sandbox-docker docker run ${imageId}`, function (error, result, stderr) {
                    if(error) {
                        res.status(500).send(error);
                        return console.log(error);
                    }
                    // cleanup the container and images from the sandbox docker
                    exec(`docker exec sandbox-docker docker container prune -f`, function(){
                        exec(`docker exec sandbox-docker docker rmi ${imageId}`);
                    })
                    // remove the run file from the sandbox docker
                    exec(`docker exec sandbox-docker rm -rf ./sandbox/node/runs/run-${runUniqId}.js`);
                    // remove the local run file
                    fs.unlink(`sandbox/node/runs/run-${runUniqId}.js`, function(err) {
                        if(err) {
                            console.log(err);
                        }
                    });
                    res.status(200).send(result);
                   // exec('docker rm -f sandbox:${runUniqId}');
                });
            });
       
    });
}

*/
