import uniqid from 'uniqid'
import fs from 'fs'
import tar from 'tar'
import path from 'path'

import { GenericContainer } from 'testcontainers'

// mode = run / test
// https://www.npmjs.com/package/testcontainers
// https://github.com/apocas/dockerode

const EXECUTION_TIMEOUT = 30000
export const runSandbox = ({
  image = 'node:latest',
  files = [],
  beforeAll = undefined,
  tests = [], doSleep = true,
}) => {
  return new Promise(async (resolve, reject) => {
    const directory = await prepareContent(files, tests)

    const { container, beforeAllOutput } = await startContainer(
      image,
      directory,
      beforeAll,
      doSleep
    )

    /* ## TIMEOUT  */
    let containerStarted = true
    let timeout = prepareTimeout(() => {
      container.stop()
      containerStarted = false
    })

    let testsResults = await execTests(container, tests)

    clearTimeout(timeout)

    if (containerStarted) {
      // If no timeout
      // Stop the container
      await container.stop()
    } else {
      reject('Execution timed out')
    }

    resolve({
      beforeAll: beforeAllOutput,
      tests: testsResults,
    })
  })
}

const prepareContent = (files, tests) =>
  new Promise((resolve, _) => {
    let codeDirectory = `sandbox/runs/tc/${uniqid()}`
    fs.mkdirSync(codeDirectory, { recursive: true })
    fs.mkdirSync(`${codeDirectory}/tests`)

    tests.map(({ input }, index) => {
      fs.writeFileSync(`${codeDirectory}/tests/test${index}.txt`, input || '')
    })

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

  const startContainer = async (image, filesDirectory, beforeAll, doSleep = true) => {
    const absoluteFilesDirectory = path.resolve(filesDirectory);
    let container = await new GenericContainer(image)
      .withBindMounts([{
        source: absoluteFilesDirectory,
        target: '/workspace',
      }])
      .withWorkingDir("/workspace")
      .withCommand(doSleep ? ['sleep', 'infinity'] : [])
      .start()
  
    // The files are now available in the '/workspace' directory in the container
  
    let beforeAllOutput = undefined
    if (beforeAll) {
      let { output } = await container.exec(['sh', '-c', beforeAll], {
        tty: false,
      })
      beforeAllOutput = cleanUpDockerStreamHeaders(output)
    }
  
    // Since we are using volume mounting, there is no need to delete the content now
    // fs.rmSync(filesDirectory, { recursive: true, force: true })
  
    return {
      beforeAllOutput,
      container,
    }
  }

const prepareTimeout = (timeoutCallback) =>
  setTimeout(() => timeoutCallback('Execution timed out'), EXECUTION_TIMEOUT)

const execTests = async (container, tests) => {
  const results = []

  for (let index = 0; index < tests.length; index++) {
    const { exec, input, expectedOutput } = tests[index]
    
    let { output } = await container.exec(
      ['sh', '-c', `${exec} < /tests/test${index}.txt`],
      { tty: false }
    )

    output = cleanUpDockerStreamHeaders(output)
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
