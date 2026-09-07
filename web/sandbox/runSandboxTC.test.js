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

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runSandbox } from './runSandboxTC'
import { SandboxOutageError } from './utils'

const startContainer = vi.fn()
const exec = vi.fn()
const stop = vi.fn()

vi.mock('testcontainers', () => ({
  GenericContainer: class {
    withResourcesQuota() {
      return this
    }
    withWorkingDir() {
      return this
    }
    withEnvironment() {
      return this
    }
    withCopyFilesToContainer() {
      return this
    }
    withCommand() {
      return this
    }
    start() {
      return startContainer()
    }
  },
}))

vi.mock('fs', () => ({
  default: {
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    createWriteStream: vi.fn(),
    rmSync: vi.fn(),
  },
}))

vi.mock('tar', () => ({
  default: { c: () => ({ pipe: () => ({ on: (_, done) => done() }) }) },
}))

const unreachableDaemon = () =>
  Object.assign(new Error('connect ECONNREFUSED 172.18.0.4:2375'), {
    code: 'ECONNREFUSED',
    syscall: 'connect',
  })

const aRun = {
  image: 'node:latest',
  files: [],
  tests: [{ exec: 'node main.js' }],
}

beforeEach(() => {
  vi.clearAllMocks()
  stop.mockResolvedValue(undefined)
  exec.mockResolvedValue({ output: 'hello' })
  startContainer.mockResolvedValue({ exec, stop })
})

describe('runSandbox, when the sandbox is unavailable', () => {
  it('throws instead of returning an empty run', async () => {
    // the regression this guards: an empty test list reads as "every test passed" to
    // callers, which graded an outage as a perfect answer
    startContainer.mockRejectedValue(unreachableDaemon())

    await expect(runSandbox(aRun)).rejects.toBeInstanceOf(SandboxOutageError)
  })

  it('recognises a failure the daemon did not explain', async () => {
    // what testcontainers reports when it cannot reach any daemon at all
    startContainer.mockRejectedValue(
      new Error('Could not find a working container runtime strategy'),
    )

    await expect(runSandbox(aRun)).rejects.toBeInstanceOf(SandboxOutageError)
  })

  it('keeps the original failure as the cause', async () => {
    const cause = unreachableDaemon()
    startContainer.mockRejectedValue(cause)

    await expect(runSandbox(aRun)).rejects.toMatchObject({ cause })
  })

  it('loses the sandbox while running the tests', async () => {
    // the first exec of a run extracts the code archive, the next ones are the tests
    exec
      .mockResolvedValueOnce({ output: '' })
      .mockRejectedValue(unreachableDaemon())

    await expect(runSandbox(aRun)).rejects.toBeInstanceOf(SandboxOutageError)
  })
})

describe('runSandbox, retrying', () => {
  it('retries an outage and returns the run that finally succeeded', async () => {
    startContainer
      .mockRejectedValueOnce(unreachableDaemon())
      .mockResolvedValue({ exec, stop })

    const result = await runSandbox(aRun)

    expect(startContainer).toHaveBeenCalledTimes(2)
    expect(result.tests).toHaveLength(1)
  })

  it('gives up after a bounded number of attempts', async () => {
    startContainer.mockRejectedValue(unreachableDaemon())

    await expect(runSandbox(aRun)).rejects.toBeInstanceOf(SandboxOutageError)
    expect(startContainer).toHaveBeenCalledTimes(3)
  })

  it('does not retry a failure the daemon explained', async () => {
    // a rejected request is our own doing and would be rejected just as fast again
    startContainer.mockRejectedValue(
      Object.assign(new Error('(HTTP code 400) bad parameter'), {
        statusCode: 400,
      }),
    )

    await expect(runSandbox(aRun)).rejects.not.toBeInstanceOf(
      SandboxOutageError,
    )
    expect(startContainer).toHaveBeenCalledTimes(1)
  })
})

describe('runSandbox, when the sandbox works', () => {
  it('returns one result per test', async () => {
    const result = await runSandbox({
      ...aRun,
      tests: [
        { exec: 'node a.js', expectedOutput: 'hello' },
        { exec: 'node b.js', expectedOutput: 'other' },
      ],
    })

    expect(result.tests).toHaveLength(2)
    expect(result.tests.map((test) => test.passed)).toEqual([true, false])
  })

  it('still reports a test that timed out as a failed test', async () => {
    exec
      .mockResolvedValueOnce({ output: '' })
      .mockRejectedValue(new Error('Execution Timeout (t > 5000ms)'))

    const result = await runSandbox(aRun)

    expect(result.tests).toHaveLength(1)
    expect(result.tests[0].passed).toBe(false)
  })

  it('stops the container', async () => {
    await runSandbox(aRun)
    expect(stop).toHaveBeenCalled()
  })
})
