/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import uniqid from 'uniqid'
import fs from 'fs'
import tar from 'tar'

import { GenericContainer } from 'testcontainers'
import {
  cleanUpDockerStreamHeaders,
  asStartOutage,
  isSandboxOutage,
  pullImageIfNotExists,
  retryOnSandboxOutage,
  SandboxOutageError,
  sanitizeUTF8,
} from './utils'

// mode = run / test
// https://www.npmjs.com/package/testcontainers
// https://github.com/apocas/dockerode

const BEFOREALL_TIMEOUT = 15000
const EXECUTION_TIMEOUT = 5000
const MAX_OUTPUT_SIZE_PER_EXEC_KB = 32

/*
Either returns a complete run — one result per test — or throws. It never reports an
empty run as if it were a result: an execution that did not happen is not a failed
execution, and callers grade on what comes back.
*/
export const runSandbox = async ({
  image = 'node:latest',
  files = [],
  beforeAll = undefined,
  tests = [],
}) => {
  const directory = await prepareContent(files)

  let container, beforeAllOutput, beforeAllTime
  try {
    ;({ container, beforeAllOutput, beforeAllTime } =
      await retryOnSandboxOutage(() =>
        startSandbox(image, directory, beforeAll),
      ))
  } finally {
    // kept until every attempt is over, since a retry copies these files again
    fs.rmSync(directory, { recursive: true, force: true })
  }

  try {
    const testsResults = await execTests(container, tests)
    return {
      beforeAll: beforeAllOutput,
      beforeAllTimeMS: beforeAllTime,
      tests: testsResults,
    }
  } finally {
    // the container is unreachable when the sandbox is down, and saying so here would
    // hide why the run failed in the first place
    await container
      .stop()
      .catch((error) => console.error('Sandbox stop', error))
  }
}

/*
Starts the container, pulling the image on first use. Any other reason for not being able
to start it is an outage: at this point nothing of the submitted code has run yet, so the
failure is ours and never the student's.
*/
const startSandbox = async (image, directory, beforeAll) => {
  try {
    return await startContainer(image, directory, beforeAll)
  } catch (initialError) {
    if (!initialError.message.includes('No such image')) {
      throw asStartOutage(initialError)
    }

    const { status, message } = await pullImageIfNotExists(image)
    if (!status) throw new SandboxOutageError(new Error(message))

    try {
      return await startContainer(image, directory, beforeAll)
    } catch (secondError) {
      throw asStartOutage(secondError)
    }
  }
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

    tar
      .c({ gzip: true, cwd: codeDirectory }, ['.'])
      .pipe(fs.createWriteStream(`${codeDirectory}/code.tar.gz`))
      .on('close', () => resolve(codeDirectory))
  })

const startContainer = async (image, filesDirectory, beforeAll) => {
  let container = await new GenericContainer(image)
    .withResourcesQuota({ cpu: 2, memory: 1 })
    .withWorkingDir('/')
    .withEnvironment('NODE_NO_WARNINGS', '1')
    .withCopyFilesToContainer([
      { source: `${filesDirectory}/code.tar.gz`, target: '/code.tar.gz' },
    ])
    .withCommand(['sleep', 'infinity'])
    .start()

  await container.exec(['sh', '-c', 'tar -xzf code.tar.gz -C /'])

  let beforeAllOutput = undefined
  let beforeAllTime = 0

  if (beforeAll) {
    try {
      const startTime = new Date().getTime()

      const execPromise = container.exec([
        'sh',
        '-c',
        `${beforeAll} 2>&1 | head -c ${MAX_OUTPUT_SIZE_PER_EXEC_KB * 1024}`,
      ])

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(new Error(`beforeAll Timeout (t > ${BEFOREALL_TIMEOUT}ms)`)),
          BEFOREALL_TIMEOUT,
        ),
      )

      const { output } = await Promise.race([execPromise, timeoutPromise])
      beforeAllOutput = sanitizeUTF8(cleanUpDockerStreamHeaders(output))

      const endTime = new Date().getTime()
      beforeAllTime = endTime - startTime
    } catch (error) {
      // a sandbox lost while preparing the run is not a beforeAll that failed
      if (isSandboxOutage(error)) throw error
      beforeAllOutput = error.message
    }
  }

  return { beforeAllOutput, beforeAllTime, container }
}

const execTests = async (container, tests) => {
  const results = []

  for (let index = 0; index < tests.length; index++) {
    const { exec, input, expectedOutput } = tests[index]

    // Start measuring execution time
    const startTime = new Date().getTime()

    try {
      // Create a promise for the execution
      const execPromise = container.exec(
        [
          'sh',
          '-c',
          `echo "${input}" | ${exec} 2>&1 | head -c ${
            MAX_OUTPUT_SIZE_PER_EXEC_KB * 1024
          }`,
        ],
        {
          tty: false,
        },
      )

      // Create a promise for the timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(new Error(`Execution Timeout (t > ${EXECUTION_TIMEOUT}ms)`)),
          EXECUTION_TIMEOUT,
        ),
      )

      // Wait for either the exec or the timeout
      const { output } = await Promise.race([execPromise, timeoutPromise])

      // Measure end time and calculate execution duration
      const endTime = new Date().getTime()
      const executionTime = endTime - startTime

      // Process output and push the result
      const sanitizedOutput = sanitizeUTF8(cleanUpDockerStreamHeaders(output))
      results.push({
        exec,
        input,
        output: sanitizedOutput,
        expectedOutput,
        executionTimeMS: executionTime,
        passed: sanitizedOutput === expectedOutput,
        timeout: false, // No timeout occurred
      })
    } catch (error) {
      // losing the sandbox mid-run is not a test the student failed
      if (isSandboxOutage(error)) throw new SandboxOutageError(error)

      // Handle timeout or other errors
      const endTime = new Date().getTime()
      const executionTime = endTime - startTime

      results.push({
        exec,
        input,
        output: error.message,
        expectedOutput,
        executionTimeMS: executionTime,
        passed: false,
        timeout: error.message === 'Execution Timeout', // Mark if it was a timeout
      })
    }
  }

  return results
}
