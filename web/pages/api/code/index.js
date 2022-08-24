var fs = require('fs');
var exec = require('child_process').exec;
const codeContent = `
    var Sum = (a, b) => a * b;
    console.log(Sum(5, 7));
`;
    
export default async function handler(req, res) {
    fs.writeFile('sandbox/temp_code.js', codeContent, function(err) {
        if(err) {
            return console.log(err);
        }
        exec("docker build -q ./sandbox", function (error, imageId, stderr) {
            exec("docker run " + imageId, function (error, result, stderr) {
                res.status(200).send(result);
                exec('docker container prune -f');
            });
        });
    });
}