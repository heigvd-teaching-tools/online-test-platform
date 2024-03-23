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
import { QuestionType, StudentPermission, QuestionSource } from '@prisma/client'

export const IncludeStrategy = {
  ALL: 'all',
  USER_SPECIFIC: 'user_specific',
}

const defaultQuestionIncludeClause = {
  includeTypeSpecific: true,
  includeOfficialAnswers: false,
  includeUserAnswers: undefined, // { strategy: IncludeStrategy.USER_SPECIFIC, userEmail: <email> } or { strategy: IncludeStrategy.ALL }
  includeGradings: false,
  includeTags: true,
}

export const questionIncludeClause = (questionIncludeOptions) => {
  // include question related entities based on the specified context

  const options = { ...defaultQuestionIncludeClause, ...questionIncludeOptions }

  const {
    includeTypeSpecific,
    includeOfficialAnswers,
    includeUserAnswers,
    includeGradings,
    includeTags,
  } = options

  const typeSpecific = includeTypeSpecific
    ? {
        code: {
          select: {
            ...(includeOfficialAnswers
              ? {
                  solutionFiles: {
                    include: {
                      file: true,
                    },
                    orderBy: { order: 'asc' },
                  },
                }
              : {}),
            templateFiles: {
              ...(!includeOfficialAnswers
                ? {
                    where: {
                      studentPermission: {
                        not: StudentPermission.HIDDEN,
                      },
                    },
                  }
                : {}),
              include: {
                file: true,
              },
              orderBy: { order: 'asc' },
            },
            language: true,
            sandbox: true,
            testCases: true,
          },
        },
        multipleChoice: {
          select: {
            options: {
              select: {
                id: true,
                text: true,
                ...(includeOfficialAnswers ? { isCorrect: true } : {}),
              },
              orderBy: [{ order: 'asc' }, { id: 'asc' }],
            },
          },
        },
        trueFalse: {
          select: {
            questionId: true,
            ...(includeOfficialAnswers ? { isTrue: true } : {}),
          },
        },
        essay: {
          select: {
            questionId: true,
            ...(includeOfficialAnswers ? { solution: true } : {}),
          },
        },
        web: {
          select: {
            questionId: true,
            templateHtml: true,
            templateCss: true,
            templateJs: true,
            ...(includeOfficialAnswers
              ? { solutionHtml: true, solutionCss: true, solutionJs: true }
              : {}),
          },
        },
        database: {
          select: {
            image: true,
            ...(includeOfficialAnswers
              ? {
                  solutionQueries: {
                    select: {
                      query: {
                        select: {
                          id: true,
                          order: true,
                          title: true,
                          description: true,
                          content: true,
                          template: true,
                          lintActive: true,
                          lintRules: true,
                          studentPermission: true,
                          testQuery: true,
                          queryOutputTests: {
                            select: {
                              test: true,
                            },
                          },
                        },
                      },
                      output: true,
                    },
                  },
                }
              : {}),
          },
        },
      }
    : {}

  let include = typeSpecific

  if (includeTags) {
    include.questionToTag = {
      include: {
        tag: true,
      },
    }
  }

  if (includeUserAnswers) {
    // no "where" for IncludeStrategy.ALL
    let saWhere =
      includeUserAnswers.strategy === IncludeStrategy.USER_SPECIFIC
        ? {
            userEmail: includeUserAnswers.userEmail,
          }
        : undefined

    include.studentAnswer = {
      where: saWhere,
      select: {
        status: true,
        user: true,
        code: {
          select: {
            files: {
              where: {
                studentPermission: {
                  not: StudentPermission.HIDDEN,
                },
              },
              include: {
                file: true,
              },
              orderBy: { order: 'asc' },
            },
            testCaseResults: true,
            allTestCasesPassed: true,
          },
        },
        database: {
          select: {
            queries: {
              include: {
                query: true,
                studentOutput: true,
              },
              orderBy: {
                query: { order: 'asc' },
              },
            },
          },
        },
        multipleChoice: {
          select: {
            options: {
              select: { id: true, text: true },
              orderBy: [{ order: 'asc' }, { id: 'asc' }],
            },
          },
        },
        essay: { select: { content: true } },
        trueFalse: true,
        web: true,
        user: true,
      },
    }

    // include gradings
    if (includeGradings) {
      include.studentAnswer.select.studentGrading = {
        include: {
          signedBy: true,
        },
      }
    }
  }

  return include
}

/*
    question is the question object from the request body
    question can be null if we are creating a new question
    using this function we can extract the type specific data (and only that) from the question object
    also used to avoid injections
 */
export const questionTypeSpecific = (
  questionType,
  question,
  mode = 'update',
) => {
  switch (questionType) {
    case QuestionType.trueFalse:
      return {
        isTrue: question?.trueFalse.isTrue ?? true,
      }
    case QuestionType.web:
      return {
        solutionHtml: question?.web.solutionHtml ?? '',
        solutionCss: question?.web.solutionCss ?? '',
        solutionJs: question?.web.solutionJs ?? '',
        templateHtml: question?.web.templateHtml ?? '',
        templateCss: question?.web.templateCss ?? '',
        templateJs: question?.web.templateJs ?? '',
      }
    case QuestionType.essay:
      return {
        solution: question?.essay.solution ?? '',
      }
    case QuestionType.multipleChoice:
      return !question
        ? {
            // default options when creating a new question
            options: {
              create: [
                { text: 'Option 1', isCorrect: false },
                { text: 'Option 2', isCorrect: true },
              ],
            },
          }
        : {
            options:
              mode === 'update'
                ? // multi choice options are no longer managed on the question level, they are managed by individual endpoints : api/questions/:id/multiple-choice/options
                  {}
                : // the only use case for mode === "create" is when we are copying questions for a evaluation, see api/evaluation [POST]
                  {
                    create: question.multipleChoice.options.map((o) => ({
                      order: o.order,
                      text: o.text,
                      isCorrect: o.isCorrect,
                    })),
                  },
          }
    default:
      return {}
  }
}

/**
 * Deep copy a question and its type-specific data.
 * @param {PrismaClient} prisma
 * @param {Object} question
 * @param {string} source
 */
export const copyQuestion = async (
  prisma,
  question,
  source = QuestionSource.EVAL,
  appendCopyInTitle = false,
) => {
  const data = {
    title: appendCopyInTitle ? `Copy of ${question.title}` : question.title,
    content: question.content,
    type: question.type,
    group: {
      connect: {
        id: question.groupId,
      },
    },
    questionToTag: {
      create: question.questionToTag.map((qTag) => ({
        tag: {
          connect: {
            label: qTag.tag.label,
          },
        },
      })),
    },
    source: source,
    sourceQuestion: {
      connect: {
        id: question.id,
      },
    },
  }

  const copyGenericQuestion = async (prisma, question) => {
    const newQuestion = await prisma.question.create({
      data: {
        ...data,
        [question.type]: {
          create: questionTypeSpecific(question.type, question, 'create'),
        },
      },
    })
    return newQuestion
  }

  const copyCodeQuestion = async (prisma, question) => {
    const newCodeQuestion = await prisma.question.create({
      data: {
        ...data,
        code: {
          create: {
            language: question.code.language,
            sandbox: {
              create: {
                image: question.code.sandbox.image,
                beforeAll: question.code.sandbox.beforeAll,
              },
            },
            testCases: {
              create: question.code.testCases.map((testCase) => ({
                index: testCase.index,
                exec: testCase.exec,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
              })),
            },
          },
        },
      },
    })

    // create the copy of template and solution files and link them to the new code questions

    for (const codeToFile of question.code.templateFiles) {
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

    for (const codeToFile of question.code.solutionFiles) {
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

    return newCodeQuestion
  }

  const copyDatabaseQuestion = async (prisma, question) => {
    const newDatabaseQuestion = await prisma.question.create({
      data: {
        ...data,
        database: {
          create: {
            image: question.database.image,
          },
        },
      },
    })

    for (const solQuery of question.database.solutionQueries) {
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

      await prisma.databaseToSolutionQuery.create({
        data: {
          questionId: newDatabaseQuestion.id,
          queryId: newQuery.id,
          outputId: newQueryOutput?.id,
        },
      })
    }

    return newDatabaseQuestion
  }

  switch (question.type) {
    case QuestionType.essay:
    case QuestionType.multipleChoice:
    case QuestionType.trueFalse:
    case QuestionType.web:
      return copyGenericQuestion(prisma, question)
    case QuestionType.code:
      return copyCodeQuestion(prisma, question)
    case QuestionType.database:
      return copyDatabaseQuestion(prisma, question)
    default:
      return null
  }
}
