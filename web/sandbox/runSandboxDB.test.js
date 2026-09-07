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
import { DatabaseQueryOutputStatus } from '@prisma/client'
import { runSandboxDB } from './runSandboxDB'
import { SandboxOutageError } from './utils'

const startContainer = vi.fn()
const connect = vi.fn()
const query = vi.fn()
const end = vi.fn()
const stop = vi.fn()

vi.mock('testcontainers', () => ({
  GenericContainer: class {
    withResourcesQuota() {
      return this
    }
    withExposedPorts() {
      return this
    }
    withWaitStrategy() {
      return this
    }
    start() {
      return startContainer()
    }
  },
  Wait: { forLogMessage: () => ({}) },
}))

vi.mock('pg', () => ({
  default: {
    Client: class {
      connect() {
        return connect()
      }
      query(sql) {
        return query(sql)
      }
      end() {
        return end()
      }
    },
  },
}))

// the shaping of a successful query is not what these tests are about
vi.mock('../core/database', () => ({
  postgresOutputToToDataset: () => ({ rows: [] }),
  postgresDetermineOutputType: () => 'TEXT',
  postgresGenerateFeedbackMessage: () => 'ok',
}))

const unreachable = (message, code) =>
  Object.assign(new Error(message), { code, syscall: 'connect' })

const aRun = { image: 'postgres:15', queries: ['select 1'] }

beforeEach(() => {
  vi.clearAllMocks()
  end.mockResolvedValue(undefined)
  stop.mockResolvedValue(undefined)
  connect.mockResolvedValue(undefined)
  query.mockResolvedValue({ command: 'SELECT', rows: [] })
  startContainer.mockResolvedValue({
    getHost: () => 'localhost',
    getFirstMappedPort: () => 5432,
    stop,
  })
})

describe('runSandboxDB, when the sandbox is unavailable', () => {
  it('throws instead of returning a failed query', async () => {
    startContainer.mockRejectedValue(
      unreachable('connect ECONNREFUSED 172.18.0.4:2375', 'ECONNREFUSED'),
    )

    await expect(runSandboxDB(aRun)).rejects.toBeInstanceOf(SandboxOutageError)
  })

  it('recognises a container that never became ready', async () => {
    // a wait strategy that times out carries no code and no status code
    startContainer.mockRejectedValue(
      new Error(
        'Log message "database system is ready" not received after 60000ms',
      ),
    )

    await expect(runSandboxDB(aRun)).rejects.toBeInstanceOf(SandboxOutageError)
  })

  it('rejects when the database becomes unreachable, rather than swallowing it', async () => {
    // this one is easy to break: a throw inside an async Promise executor is silently
    // lost, so the rejection has to be explicit
    connect.mockRejectedValue(unreachable('connect ECONNRESET', 'ECONNRESET'))

    await expect(runSandboxDB(aRun)).rejects.toBeInstanceOf(SandboxOutageError)
  })

  it('rejects when the connection drops between two queries', async () => {
    query
      .mockResolvedValueOnce({ command: 'SELECT', rows: [] })
      .mockRejectedValue(unreachable('read ECONNRESET', 'ECONNRESET'))

    await expect(
      runSandboxDB({ ...aRun, queries: ['select 1', 'select 2'] }),
    ).rejects.toBeInstanceOf(SandboxOutageError)
  })
})

describe('runSandboxDB, retrying', () => {
  it('retries an outage and returns the run that finally succeeded', async () => {
    const container = {
      getHost: () => 'localhost',
      getFirstMappedPort: () => 5432,
      stop,
    }
    startContainer
      .mockRejectedValueOnce(
        unreachable('connect ECONNREFUSED', 'ECONNREFUSED'),
      )
      .mockResolvedValue(container)

    const results = await runSandboxDB(aRun)

    expect(startContainer).toHaveBeenCalledTimes(2)
    expect(results).toHaveLength(1)
  })

  it('gives up after a bounded number of attempts', async () => {
    startContainer.mockRejectedValue(
      unreachable('connect ECONNREFUSED', 'ECONNREFUSED'),
    )

    await expect(runSandboxDB(aRun)).rejects.toBeInstanceOf(SandboxOutageError)
    expect(startContainer).toHaveBeenCalledTimes(3)
  })
})

describe('runSandboxDB, when the sandbox works', () => {
  it('keeps a query the database rejected as a result, not as an outage', async () => {
    // the student's SQL is theirs to get wrong
    query.mockRejectedValue(
      Object.assign(new Error('syntax error at or near "slect"'), {
        code: '42601',
      }),
    )

    const results = await runSandboxDB(aRun)

    expect(results).toHaveLength(1)
    expect(results[0].status).toBe(DatabaseQueryOutputStatus.ERROR)
  })

  it('returns one result per query', async () => {
    const results = await runSandboxDB({
      ...aRun,
      queries: ['select 1', 'select 2'],
    })

    expect(results).toHaveLength(2)
    expect(
      results.every((r) => r.status === DatabaseQueryOutputStatus.SUCCESS),
    ).toBe(true)
  })
})
