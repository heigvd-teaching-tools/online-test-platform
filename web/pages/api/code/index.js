//  tar zcvf dockerfile.tar.gz .
import { runSandbox } from "../../../sandbox/runSandbox";

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
