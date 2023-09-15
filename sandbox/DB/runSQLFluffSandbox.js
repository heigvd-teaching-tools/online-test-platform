import uniqid from 'uniqid'
import fs from 'fs'
import Docker  from "dockerode";
import path from 'path'

const docker = new Docker();

export const runSQLFluffSandbox = async ({ sql, sqlfluffRules }) => {
    let absoluteFilesDirectory = null;
    try {
        // Step 1: Prepare the files
        const files = [
            { path: 'query.sql', content: sql },
            { path: 'query2.sql', content: sql },
            { path: 'query3.sql', content: sql },
            { path: '.sqlfluff', content: sqlfluffRules }
        ];
        
        const directory = await prepareContent(files);
        absoluteFilesDirectory = path.resolve(directory);

        const containerOpts = {
            Image: "sqlfluff/sqlfluff:latest",
            Tty: false,  // The `-it` flag
            Cmd: ['lint', '.', '--dialect', 'postgres', '--format', 'json'],
            HostConfig: {
                AutoRemove: true,
                Binds: [
                    `${absoluteFilesDirectory}:/sql`  
                ]
            }
        };
        
        return new Promise((resolve, reject) => {    
            docker.createContainer(containerOpts, (err, container) => {
                if (err) {
                    return reject("Error creating container: " + err.message);
                }
            
                container.start({}, (err, _) => {
                    if (err) {
                        return reject("Error starting container: " + err.message);
                    } else {
                        container.wait((err, _) => {
                            if (err) {
                                return reject("Error waiting for container: " + err.message);
                            }
                
                            container.logs({ stdout: true, stderr: true }, (err, data) => {
                                if (err) {
                                    return reject("Error getting logs: " + err.message);
                                }
                                
                                const stdout = data.toString('utf-8');
                                return resolve(JSON.parse(cleanUpDockerStreamHeaders(stdout)));
                            });
                        });
                    }
                });
            });
        }).finally(async () => {
            // Clean up the files
            await fs.promises.rm(absoluteFilesDirectory, { recursive: true }).catch(err => console.error('Failed to delete directory:', err));
        });
    } catch (error) {
        return Promise.reject('Unexpected error: ' + error.message);
    } 
};

const prepareContent = (files) =>
  new Promise((resolve, _) => {
    let codeDirectory = `sandbox/runs/tc/${uniqid()}`
    fs.mkdirSync(codeDirectory, { recursive: true })

    files.map(({ path, content }) => {
      let filesDirectory = `${codeDirectory}/${path
        .split('/')
        .slice(0, -1)
        .join('/')}`
      let fileName = path.split('/').slice(-1)[0]

      fs.mkdirSync(filesDirectory, { recursive: true })

      fs.writeFileSync(`${filesDirectory}/${fileName}`, content || '')
    })

    resolve(codeDirectory)
  })

  
const cleanUpDockerStreamHeaders = (input) => {
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
  
    let output = ''
  
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== '\x01' && input[i] !== '\x02') {
        output += input[i]
      } else {
        i += 7
      }
    }
  
    return output
  }
  