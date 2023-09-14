import uniqid from 'uniqid'
import fs from 'fs'
import Docker  from "dockerode";
import path from 'path'
import { cleanUpDockerStreamHeaders } from "./utils";

const docker = new Docker();
export const runSQLFluffSandbox = async ({ sql, sqlFluffRules, dialect = "postgres" }) => {
    let absoluteFilesDirectory = null;
    try {
        // Step 1: Prepare the files
        const files = [
            { path: 'query.sql', content: sql },
            { path: '.sqlfluff', content: sqlFluffRules }
        ];

        const directory = await prepareContent(files);
        absoluteFilesDirectory = path.resolve(directory);

        const containerOpts = {
            Image: "sqlfluff/sqlfluff:latest",
            Tty: false,  // The `-it` flag
            Cmd: ['lint', 'query.sql', '--dialect', dialect, '--format', 'json'],
            HostConfig: {
                //AutoRemove: true,
                Binds: [
                    `${absoluteFilesDirectory}:/sql`
                ]
            }
        };

        let container = null;

        return new Promise((resolve, reject) => {
            docker.createContainer(containerOpts, (err, createdContainer) => {

                if (err) {
                    return reject("Error creating container: " + err.message);
                }

                container = createdContainer;

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
                                return resolve(
                                    groupByViolations(
                                        JSON.parse(
                                            cleanUpDockerStreamHeaders(stdout)
                                        )
                                    )
                                );
                            });
                        });
                    }
                });
            });
        }).finally(async () => {
            // Clean up the files
            await fs.promises.rm(absoluteFilesDirectory, { recursive: true }).catch(err => console.error('Failed to delete directory:', err));

            /*
                Remove the Docker container manually,
                AutoRemove option makes the logs retrieval fail every now and then with error:
                "(HTTP code 409) unexpected - can not get logs from container which is dead or marked for removal"
             */

            container.remove(err => {
                if (err) {
                    console.error('Error removing container:', err);
                }
            });
        });
    } catch (error) {
        return Promise.reject('Unexpected error: ' + error.message);
    }
};

const groupByViolations = (lintResults) => {
    if(lintResults.length === 0){
        return {
            violations: []
        };
    }

    const lintResult = lintResults[0];

    const groupedViolations = {};

    lintResult.violations.forEach((violation) => {
        const { line_no, line_pos, code, description, name } = violation;

        if (!groupedViolations[code]) {
            groupedViolations[code] = {
                description,
                name,
                code,
                lines: [],
            };
        }

        groupedViolations[code].lines.push({ line: line_no, pos: line_pos });
    });

    lintResult.violations = Object.values(groupedViolations);

    return lintResult;
}

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

