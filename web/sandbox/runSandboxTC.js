import uniqid from 'uniqid'
import fs from 'fs'
import tar from 'tar'

import { GenericContainer } from 'testcontainers'
import {cleanUpDockerStreamHeaders, sanitizeUTF8} from "./utils";

// mode = run / test
// https://www.npmjs.com/package/testcontainers
// https://github.com/apocas/dockerode

const EXECUTION_TIMEOUT = 5000
const MAX_OUTPUT_SIZE_PER_EXEC_KB = 256


export const runSandbox = async ({ image = 'node:latest', files = [], beforeAll = undefined, tests = [] }) => {
  const directory = await prepareContent(files);

  const { container, beforeAllOutput } = await startContainer(image, directory, beforeAll);

  return new Promise(async (resolve, reject) => {
      

      let timeout = setTimeout(() => {
          container.stop();
          resolve({
              beforeAll: "Execution Timeout",
              tests: [],
          });
      }, EXECUTION_TIMEOUT);

      try {
          const testsResults = await execTests(container, tests);
          clearTimeout(timeout);  // Clear the timeout if tests finish on time
          resolve({
              beforeAll: beforeAllOutput,
              tests: testsResults,
          });
      } catch (error) {
          clearTimeout(timeout);  // Clear the timeout if there's an error
          reject(error);  // This will propagate the error outside if you wish to handle it
      } finally {
          await container.stop();
      }
  });
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

    tar
      .c({ gzip: true, cwd: codeDirectory }, ['.'])
      .pipe(fs.createWriteStream(`${codeDirectory}/code.tar.gz`))
      .on('close', () => resolve(codeDirectory))
  })

const startContainer = async (image, filesDirectory, beforeAll) => {

  let container = await new GenericContainer(image)
    .withResourcesQuota({
      cpu: 0.30,          //a CPU core
      memory: 0.25
      
    })
    .withWorkingDir('/')
    .withEnvironment('NODE_NO_WARNINGS', '1')
    .withCopyFilesToContainer([
      { source: `${filesDirectory}/code.tar.gz`, target: '/code.tar.gz' },
    ])
    .withCommand(['sleep', 'infinity'])
    .start()

  await container.exec(['sh', '-c', 'tar -xzf code.tar.gz -C /'], {
    tty: false,
  })
  let beforeAllOutput = undefined
  if (beforeAll) {
    let { output } = await container.exec(['sh', '-c', `${beforeAll} 2>&1`], {
      tty: false,
    })
    beforeAllOutput = sanitizeUTF8(cleanUpDockerStreamHeaders(output))
  }

  /* ## CONTENT DELETE */
  fs.rmSync(filesDirectory, { recursive: true, force: true })

  return {
    beforeAllOutput,
    container,
  }
}

const execTests = async (container, tests) => {
  const results = []

  for (let index = 0; index < tests.length; index++) {
    const { exec, input, expectedOutput } = tests[index]
    // time before execution
    const startTime = new Date().getTime()
    let { output } = await container.exec(
        ['sh', '-c', `echo "${input}" | ${exec} 2>&1 | dd bs=${MAX_OUTPUT_SIZE_PER_EXEC_KB}K count=1`],
        { tty: false }
    )
    // time after execution
    const endTime = new Date().getTime()
    // time difference
    const executionTime = endTime - startTime
    output = sanitizeUTF8(cleanUpDockerStreamHeaders(output))
    results.push({
      exec,
      input,
      output,
      expectedOutput,
      executionTimeMS: executionTime,
      passed: output === expectedOutput,
    })
  }

  return results
}
