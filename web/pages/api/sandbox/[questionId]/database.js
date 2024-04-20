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
import { Role, Prisma } from '@prisma/client'
import { runSandboxDB } from '@/sandbox/runSandboxDB'
import { runSQLFluffSandbox } from '@/sandbox/runSQLFluffSandbox'
import {
  withAuthorization,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { withQuestionUpdate } from '@/middleware/withUpdate'

/*
 endpoint to run the sandbox for a database question with queries recovered from the database
 */
const post = async (req, res, prisma) => {
  const { questionId } = req.query

  const database = await prisma.database.findUnique({
    where: {
      questionId: questionId,
    },
    include: {
      solutionQueries: {
        include: {
          query: true,
        },
        orderBy: {
          query: {
            order: 'asc',
          },
        },
      },
    },
  })

  const queries = database.solutionQueries.map(
    (dbToSolQuery) => dbToSolQuery.query.content,
  )

  const result = await runSandboxDB({
    image: database.image,
    queries: queries,
  })

  await prisma.$transaction(async (prisma) => {
    // for each query, upsert the DatabaseQueryOutput in the database
    for (let i = 0; i < database.solutionQueries.length; i++) {
      const query = database.solutionQueries[i].query
      const output = result[i]

      if (query.lintActive) {
        let lintResult

        try {
          // run the lint sandbox
          lintResult = await runSQLFluffSandbox({
            sql: query.content,
            rules: query.lintRules,
          })
        } catch (e) {
          console.log('Lint Sandbox Error', e)
        }

        // update the DatabaseQuery with the lint result
        await prisma.databaseQuery.update({
          where: {
            id: query.id,
          },
          data: {
            lintResult: !lintResult ? Prisma.JsonNull : lintResult,
          },
        })
      }

      const databaseToSolutionQuery =
        await prisma.databaseToSolutionQuery.findUnique({
          where: {
            questionId_queryId: {
              questionId: questionId,
              queryId: query.id,
            },
          },
          include: {
            output: true,
          },
        })

      const existingOutput = databaseToSolutionQuery.output

      if (output) {
        // output can be null if some of the previous queries failed
        const outputData = {
          output: output,
          type: output.type,
          status: output.status,
        }
        // we got an output for this query
        if (existingOutput) {
          // update existing output
          await prisma.databaseQueryOutput.update({
            where: {
              id: existingOutput.id,
            },
            data: {
              ...outputData,
            },
          })
        } else {
          // create new output and connect it to the solution query
          await prisma.databaseQueryOutput.create({
            data: {
              ...outputData,
              querySolution: {
                connect: {
                  questionId_queryId: {
                    questionId: questionId,
                    queryId: query.id,
                  },
                },
              },
              query: {
                // this relation is needed for the output to be deleted when the query is deleted
                connect: {
                  id: query.id,
                },
              },
            },
          })
        }
      } else {
        // some previous queries failed, lets delete the output of the next queries
        if (existingOutput) {
          await prisma.databaseQueryOutput.delete({
            where: {
              id: existingOutput.id,
            },
          })
        }
      }
    }
  })

  const solutionQueries = await prisma.databaseToSolutionQuery.findMany({
    where: {
      questionId: questionId,
    },
    include: {
      output: true,
      query: {
        select: {
          lintResult: true,
        },
      },
    },
    orderBy: {
      query: {
        order: 'asc',
      },
    },
  })

  if (!solutionQueries) res.status(404).json({ message: 'Not found' })

  res.status(200).json(solutionQueries)
}

export default withMethodHandler({
  POST: withAuthorization(withQuestionUpdate(withPrisma(post)), [
    Role.PROFESSOR,
  ]),
})
