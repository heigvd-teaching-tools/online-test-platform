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
import { Role, EvaluationPhase, QuestionType } from '@prisma/client'
import { withPrisma } from '@/middleware/withPrisma'
import {
  withAuthorization,
  withGroupScope,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { questionIncludeClause, questionTypeSpecific } from '@/code/questions'

const get = async (req, res, prisma) => {
  // shallow session to question get -> we just need to count the number of questions
  const { groupScope } = req.query

  const evaluations = await prisma.evaluation.findMany({
    where: {
      group: {
        scope: groupScope,
      },
    },
    include: {
      evaluationToQuestions: true,
      students: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
  res.status(200).json(evaluations)
}

/*
** Creating a new evaluation
The questions from the collection are all deep copied to the evaluation
The reason for this is that the questions in the collection can be changed after the evaluation is created
The evaluation must freeze the questions at the time of creation
The code questions are copied with all the files
The database questions are copied with all the queries and their outputs
* */
const post = async (req, res, prisma) => {
  const { label, conditions, duration, collectionId } = req.body

  const { groupScope } = req.query

  if (!collectionId) {
    res.status(400).json({ message: 'No collection selected.' })
    return
  }

  // select all questions from a collection
  const collectionToQuestions = await prisma.collectionToQuestion.findMany({
    include: {
      question: {
        include: questionIncludeClause({
          includeTypeSpecific: true,
          includeOfficialAnswers: true,
        }),
      },
    },
    where: {
      collectionId,
    },
  })

  if (
    !collectionToQuestions ||
    (collectionToQuestions && collectionToQuestions.length === 0)
  ) {
    res.status(400).json({ message: 'Your collection has no questions.' })
    return
  }

  if (label.length === 0) {
    res.status(400).json({ message: 'Please enter a label.' })
    return
  }

  let data = {
    phase: EvaluationPhase.DRAFT,
    label,
    conditions,
    group: {
      connect: {
        scope: groupScope,
      },
    },
  }

  if (duration) {
    data.durationHours = parseInt(duration.hours)
    data.durationMins = parseInt(duration.minutes)
  }

  try {
    let evaluation = undefined
    await prisma.$transaction(async (prisma) => {
      evaluation = await prisma.evaluation.create({ data })

      // create the copy of all questions, except code and database, for the evaluation
      for (const collectionToQuestion of collectionToQuestions.filter(
        (ctq) =>
          ctq.question.type !== QuestionType.code &&
          ctq.question.type !== QuestionType.database,
      )) {
        // create question
        const question = await prisma.question.create({
          data: {
            title: collectionToQuestion.question.title,
            content: collectionToQuestion.question.content,
            type: collectionToQuestion.question.type,
            group: {
              connect: {
                id: collectionToQuestion.question.groupId,
              },
            },
            [collectionToQuestion.question.type]: {
              create: questionTypeSpecific(
                collectionToQuestion.question.type,
                collectionToQuestion.question,
                'create',
              ),
            },
          },
        })
        // create relation between evaluation and question
        await prisma.evaluationToQuestion.create({
          data: {
            points: collectionToQuestion.points,
            order: collectionToQuestion.order,
            evaluation: {
              connect: {
                id: evaluation.id,
              },
            },
            question: {
              connect: {
                id: question.id,
              },
            },
          },
        })
      }

      // CODE
      // create the copy of code questions for the evaluation
      for (const collectionToQuestion of collectionToQuestions.filter(
        (ctq) => ctq.question.type === QuestionType.code,
      )) {
        // create code question, without files
        const newCodeQuestion = await prisma.question.create({
          data: {
            title: collectionToQuestion.question.title,
            content: collectionToQuestion.question.content,
            group: {
              connect: {
                id: collectionToQuestion.question.groupId,
              },
            },
            type: QuestionType.code,
            code: {
              create: {
                language: collectionToQuestion.question.code.language,
                sandbox: {
                  create: {
                    image: collectionToQuestion.question.code.sandbox.image,
                    beforeAll:
                      collectionToQuestion.question.code.sandbox.beforeAll,
                  },
                },
                testCases: {
                  create: collectionToQuestion.question.code.testCases.map(
                    (testCase) => ({
                      index: testCase.index,
                      exec: testCase.exec,
                      input: testCase.input,
                      expectedOutput: testCase.expectedOutput,
                    }),
                  ),
                },
              },
            },
          },
        })

        // create relation between evaluation and question
        await prisma.evaluationToQuestion.create({
          data: {
            points: collectionToQuestion.points,
            order: collectionToQuestion.order,
            evaluation: {
              connect: {
                id: evaluation.id,
              },
            },
            question: {
              connect: {
                id: newCodeQuestion.id,
              },
            },
          },
        })

        // create the copy of template and solution files and link them to the new code questions
        for (const codeToFile of collectionToQuestion.question.code
          .templateFiles) {
          const newFile = await prisma.file.create({
            data: {
              path: codeToFile.file.path,
              content: codeToFile.file.content,
              createdAt: codeToFile.file.createdAt, // for deterministic ordering
              code: {
                connect: {
                  questionId: newCodeQuestion.id,
                },
              },
            },
          })
          await prisma.codeToTemplateFile.create({
            data: {
              questionId: newCodeQuestion.id,
              fileId: newFile.id,
              order: codeToFile.order,
              studentPermission: codeToFile.studentPermission,
            },
          })
        }

        for (const codeToFile of collectionToQuestion.question.code
          .solutionFiles) {
          const newFile = await prisma.file.create({
            data: {
              path: codeToFile.file.path,
              content: codeToFile.file.content,
              createdAt: codeToFile.file.createdAt, // for deterministic ordering
              code: {
                connect: {
                  questionId: newCodeQuestion.id,
                },
              },
            },
          })
          await prisma.codeToSolutionFile.create({
            data: {
              questionId: newCodeQuestion.id,
              fileId: newFile.id,
              order: codeToFile.order,
              studentPermission: codeToFile.studentPermission,
            },
          })
        }
      }

      // DATABASE
      // create the copy of database questions for the evaluation
      for (const collectionToQuestion of collectionToQuestions.filter(
        (ctq) => ctq.question.type === QuestionType.database,
      )) {
        // create database question for evaluation
        const newDatabaseQuestion = await prisma.question.create({
          data: {
            title: collectionToQuestion.question.title,
            content: collectionToQuestion.question.content,
            group: {
              connect: {
                id: collectionToQuestion.question.groupId,
              },
            },
            type: QuestionType.database,
            database: {
              create: {
                image: collectionToQuestion.question.database.image,
              },
            },
          },
        })

        // create relation between evaluation and new question
        await prisma.evaluationToQuestion.create({
          data: {
            points: collectionToQuestion.points,
            order: collectionToQuestion.order,
            evaluation: {
              connect: {
                id: evaluation.id,
              },
            },
            question: {
              connect: {
                id: newDatabaseQuestion.id,
              },
            },
          },
        })

        // create the copy of queries
        for (const solQuery of collectionToQuestion.question.database
          .solutionQueries) {
          const query = solQuery.query
          const output = solQuery.output

          const newQuery = await prisma.databaseQuery.create({
            data: {
              order: query.order,
              title: query.title,
              description: query.description,
              content: query.content,
              template: query.template,
              lintActive: query.lintActive,
              lintRules: query.lintRules,
              studentPermission: query.studentPermission,
              testQuery: query.testQuery,
              queryOutputTests: {
                create: query.queryOutputTests.map((test) => ({
                  test: test.test,
                })),
              },
              database: {
                connect: {
                  questionId: newDatabaseQuestion.id,
                },
              },
            },
          })

          let newQueryOutput = undefined

          if (output) {
            newQueryOutput = await prisma.databaseQueryOutput.create({
              data: {
                output: output.output,
                status: output.status,
                type: output.type,
                dbms: output.dbms,
                query: {
                  connect: {
                    id: newQuery.id,
                  },
                },
              },
            })
          }

          // connect new queries as sulution queries to the question
          await prisma.databaseToSolutionQuery.create({
            data: {
              questionId: newDatabaseQuestion.id,
              queryId: newQuery.id,
              outputId: newQueryOutput?.id,
            },
          })
        }
      }
    })

    res.status(200).json(evaluation)
  } catch (e) {
    console.log(e)
    switch (e.code) {
      case 'P2002':
        res.status(409).json({ message: 'evaluation label already exists' })
        break
      default:
        res.status(500).json({ message: 'Error while creating a evaluation' })
        break
    }
  }
}

export default withMethodHandler({
  GET: withAuthorization(withGroupScope(withPrisma(get)), [Role.PROFESSOR]),
  POST: withAuthorization(withGroupScope(withPrisma(post)), [Role.PROFESSOR]),
})
