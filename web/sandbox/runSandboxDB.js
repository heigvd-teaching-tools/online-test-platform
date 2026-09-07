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

import { GenericContainer, Wait } from 'testcontainers'

import {
  DatabaseQueryOutputStatus,
  DatabaseQueryOutputType,
} from '@prisma/client'
import pkg from 'pg'
import {
  postgresDetermineOutputType,
  postgresGenerateFeedbackMessage,
  postgresOutputToToDataset,
} from '../core/database'
import {
  asStartOutage,
  isSandboxOutage,
  pullImageIfNotExists,
  releaseQuietly,
  retryOnSandboxOutage,
  SandboxOutageError,
} from './utils'

const { Client } = pkg

const EXECUTION_TIMEOUT = 5000

const startContainer = async (image) => {
  const container = await new GenericContainer(image)
    .withResourcesQuota({
      cpu: 0.35, // of a CPU core
      memory: 0.5, // in GB
    })
    .withExposedPorts(5432)
    .withWaitStrategy(
      Wait.forLogMessage('database system is ready to accept connections'),
    )
    .start()
  return container
}

/*
Starts the database container, pulling the image on first use. Any other reason for not
being able to start it is an outage: no query has run at that point.
*/
const startSandbox = async (image) => {
  try {
    return await startContainer(image)
  } catch (initialError) {
    if (!initialError.message.includes('No such image')) {
      throw asStartOutage(initialError)
    }

    const { status, message, error } = await pullImageIfNotExists(image)
    if (!status) throw asStartOutage(error ?? new Error(message))

    try {
      return await startContainer(image)
    } catch (secondError) {
      throw asStartOutage(secondError)
    }
  }
}

/*
A run that outlived its budget. Racing rather than cancelling: the queries keep going
until the connection is closed, which is what the original timeout did too.
*/
const TIMED_OUT = Symbol('timed out')

const withExecutionTimeout = async (work) => {
  let timer
  try {
    return await Promise.race([
      work,
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(TIMED_OUT), EXECUTION_TIMEOUT)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

const textResult = (message) => ({
  status: DatabaseQueryOutputStatus.ERROR,
  feedback: message,
  type: DatabaseQueryOutputType.TEXT,
  result: message,
})

const runQueries = async (client, queries, results) => {
  await client.connect()

  let order = 1
  for (const query of queries) {
    const result = await client.query(query)
    const dataset = postgresOutputToToDataset(result)
    const type = postgresDetermineOutputType(result)
    const feedback = postgresGenerateFeedbackMessage(result.command, result)
    results.push({
      order: order++,
      status: DatabaseQueryOutputStatus.SUCCESS,
      feedback: feedback,
      type: type,
      result: type === DatabaseQueryOutputType.TEXT ? feedback : dataset,
    })
  }
}

/*
Either returns one result per query — a failing query included, since the SQL is the
student's to get wrong — or throws when the sandbox itself could not run them.
*/
export const runSandboxDB = async ({
  image = 'postgres:latest',
  databaseConfig = {
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  },
  queries = [], // string[]
}) => {
  const results = []
  const container = await retryOnSandboxOutage(() => startSandbox(image))
  let client

  try {
    try {
      client = new Client({
        host: container.getHost(),
        port: container.getFirstMappedPort(),
        ...databaseConfig,
      })
    } catch (error) {
      if (isSandboxOutage(error)) throw new SandboxOutageError(error)
      results.push(textResult(`Client connection error: ${error.message}`))
      return results
    }

    try {
      const outcome = await withExecutionTimeout(
        runQueries(client, queries, results),
      )
      if (outcome === TIMED_OUT) {
        results.push(textResult('Sandbox Execution Timeout'))
      }
    } catch (error) {
      // losing the database container is an outage, unlike a query it rejected: the
      // connection and the queries fail in the same place, only the error tells them
      // apart
      if (isSandboxOutage(error)) throw new SandboxOutageError(error)

      results.push({
        order: results.length + 1,
        status: DatabaseQueryOutputStatus.ERROR,
        feedback: error.message,
        type: DatabaseQueryOutputType.TEXT,
        result: error,
      })
    }

    return results
  } finally {
    if (client) await releaseQuietly('database client', () => client.end())
    await releaseQuietly('database container', () => container.stop())
  }
}
