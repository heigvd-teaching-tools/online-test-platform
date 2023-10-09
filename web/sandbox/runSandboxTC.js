import uniqid from 'uniqid'
import fs from 'fs'
import tar from 'tar'

import { GenericContainer } from 'testcontainers'
import {cleanUpDockerStreamHeaders, sanitizeUTF8} from "./utils";

// mode = run / test
// https://www.npmjs.com/package/testcontainers
// https://github.com/apocas/dockerode

const EXECUTION_TIMEOUT = 30000
export const runSandbox = async ({ image = 'node:latest', files = [], beforeAll = undefined, tests = [] }) => {
  const directory = await prepareContent(files);

  const { container, beforeAllOutput } = await startContainer(image, directory, beforeAll);

  let timeout;
  try {
      timeout = setTimeout(() => {
          container.stop();
          throw new Error('Execution timed out');
      }, EXECUTION_TIMEOUT);

      const testsResults = await execTests(container, tests);

      return {
          beforeAll: beforeAllOutput,
          tests: testsResults,
      };
  } finally {
      clearTimeout(timeout);
      await container.stop();
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

    tar
      .c({ gzip: true, cwd: codeDirectory }, ['.'])
      .pipe(fs.createWriteStream(`${codeDirectory}/code.tar.gz`))
      .on('close', () => resolve(codeDirectory))
  })

const startContainer = async (image, filesDirectory, beforeAll) => {

  let container = await new GenericContainer(image)
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
    let { output } = await container.exec(
        ['sh', '-c', `echo "${input}" | ${exec} 2>&1`],
        { tty: false }
    )
    output = sanitizeUTF8(cleanUpDockerStreamHeaders(output))
    results.push({
      exec,
      input,
      output,
      expectedOutput,
      passed: output === expectedOutput,
    })
  }

  return results
}
