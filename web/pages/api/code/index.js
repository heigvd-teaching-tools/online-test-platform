var uniqid = require('uniqid'); 
var fs = require('fs');
var exec = require('child_process').exec;
const codeContent = `
    var Sum = (a, b) => a * b;
    console.log(Sum(444, 137));
`;

// 
    
export default async function handler(req, res) {
    let runUniqId = `${uniqid()}`;

    /*
        Run the docker sandbox dind ("Docker in Docker")
        docker run --privileged --name sandbox-docker docker:dind

        Copy sandbox environement docker files to the sandbox docker
        docker cp ./sandbox sandbox-docker:/
    */ 
    
    // prepare the file to execute
    fs.writeFile(`sandbox/node/runs/run-${runUniqId}.js`, codeContent, function(err) {
        if(err) {
            res.status(500).send(err);
            return console.log(err);
        }
        // copy the file to the sandbox docker
        exec(`docker cp ./sandbox/node/runs/run-${runUniqId}.js sandbox-docker:/sandbox/node/runs`, function (error, imageId, stderr) {
            if (error) {
                res.status(500).send(error);
                return console.log(error);
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
    });
}
