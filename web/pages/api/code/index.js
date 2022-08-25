var uniqid = require('uniqid'); 
var fs = require('fs');
var exec = require('child_process').exec;
const codeContent = `
    var Sum = (a, b) => a * b;
    console.log(Sum(12, 17));
`;

    
export default async function handler(req, res) {
    let runUniqId = `${uniqid()}`;

    fs.writeFile(`sandbox/runs/run-${runUniqId}.js`, codeContent, function(err) {
        if(err) {
            res.status(500).send(err);
            return console.log(err);
        }
        exec(`docker build -q ./sandbox --build-arg "file_name=run-${runUniqId}.js" --tag sandbox:img-${runUniqId}`, function (error, imageId, stderr) {
            if(error) {
                res.status(500).send(error);
                return console.log(error);
            }
            exec(`docker run ${imageId}`, function (error, result, stderr) {
                if(error) {
                    res.status(500).send(error);
                    return console.log(error);
                }
                exec(`docker container prune -f`, function(){
                    exec(`docker rmi ${imageId}`);
                   //exec(`docker image prune -f`);
                })
                fs.unlink(`sandbox/runs/run-${runUniqId}.js`, function(err) {
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
