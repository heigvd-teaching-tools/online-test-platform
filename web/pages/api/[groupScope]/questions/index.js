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
import {
  Role,
  QuestionType,
  QuestionSource,
  CodeQuestionType,
} from '@prisma/client'
import {
  withAuthorization,
  withGroupScope,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import {
  codeInitialUpdateQuery,
  questionIncludeClause,
  questionTypeSpecific,
} from '@/code/questions'

import languages from '@/code/languages.json'

const environments = languages.environments

/**
 * Managing the questions of a group
 *
 * get: list questions of a group (filter by title, content, tags, question types, code languages)
 * post: create a new question
 * del: delete a question
 *
 */

const get = async (req, res, prisma) => {
  let { groupScope, search, tags, questionTypes, codeLanguages } = req.query

  questionTypes = questionTypes
    ? questionTypes.split(',').map((type) => QuestionType[type])
    : []
  codeLanguages = codeLanguages ? codeLanguages.split(',') : []

  tags = tags ? tags.split(',') : []

  let where = {
    where: {
      group: {
        scope: groupScope,
      },
      source: {
        in: [QuestionSource.BANK, QuestionSource.COPY],
      },
      AND: [],
    },
  }

  // use AND for title and content
  if (search) {
    where.where.AND.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    })
  }

  if (tags.length > 0) {
    where.where.AND.push({
      questionToTag: {
        some: {
          label: {
            in: tags,
            mode: 'insensitive',
          },
        },
      },
    })
  }

  // Apply filters for question types if specified
  if (questionTypes.length > 0) {
    where.where.AND.push({
      type: { in: questionTypes },
    })
  }

  // Apply filters for code languages specifically for 'code' type questions
  if (questionTypes.includes(QuestionType.code) && codeLanguages.length > 0) {
    where.where.AND.push({
      code: { language: { in: codeLanguages } },
    })
  }

  const questions = await prisma.question.findMany({
    ...where,
    include: {
      ...questionIncludeClause({
        includeTypeSpecific: true,
        includeOfficialAnswers: true,
      }),
      evaluation: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  res.status(200).json(questions)
}

const post = async (req, res, prisma) => {
  // create a new question -> at this point we only know the question type
  const { groupScope } = req.query
  const { type, options } = req.body
  const questionType = QuestionType[type]

  if (!questionType) {
    res.status(400).json({ message: 'Invalid question type' })
    return
  }

  let createdQuestion = await prisma.question.create({
    data: {
      type: questionType,
      title: '',
      content: '',
      [questionType]: {
        create: questionTypeSpecific(questionType, null),
      },
      group: {
        connect: {
          scope: groupScope,
        },
      },
    },
    include: questionIncludeClause(true, true),
  })

  if (questionType === QuestionType.code) {
    // this must be done in a separate query because the files must be connected to the already existing code question
    const language = options?.language
    const codeQuestionType = options?.codeQuestionType
    // get the default code for the language
    const defaultCode = defaultCodeBasedOnLanguageAndType(
      language,
      codeQuestionType,
    )
    // update the empty initial code with the default code
    await prisma.code.update(
      codeInitialUpdateQuery(createdQuestion.id, defaultCode, codeQuestionType),
    )
    createdQuestion = await prisma.question.findUnique({
      where: {
        id: createdQuestion.id,
      },
      include: questionIncludeClause(true, true),
    })
  }

  res.status(200).json(createdQuestion)
}

const del = async (req, res, prisma) => {
  const { question } = req.body

  if (!question?.id) {
    res.status(400).json({ message: 'Bad Request' })
    return
  }

  // find all the collections that contain this question
  const collections = await prisma.collection.findMany({
    where: {
      collectionToQuestions: {
        some: {
          questionId: question.id,
        },
      },
    },
    include: {
      collectionToQuestions: true,
    },
  })

  let deletedQuestion = undefined
  await prisma.$transaction(async (prisma) => {
    // decrease the order of CollectionToQuestion for all orders greater than the order of the question in the collection
    for (const collection of collections) {
      // filter the collectionToQuestions that have a greater order than the question
      const collectionToQuestions = collection.collectionToQuestions.filter(
        (ctq) =>
          ctq.order >
          collection.collectionToQuestions.find(
            (ctq) => ctq.questionId === question.id,
          ).order,
      )
      for (const ctq of collectionToQuestions) {
        await prisma.collectionToQuestion.update({
          where: {
            collectionId_questionId: {
              collectionId: ctq.collectionId,
              questionId: ctq.questionId,
            },
          },
          data: {
            order: ctq.order - 1,
          },
        })
      }
    }
    // delete the question
    deletedQuestion = await prisma.question.delete({
      where: {
        id: question.id,
      },
    })
  })

  res.status(200).json(deletedQuestion)
}

const defaultCodeBasedOnLanguageAndType = (language, codeQuestionType) => {
  const index = environments.findIndex((env) => env.language === language)
  const environment = environments[index]

  const data = {
    language: environment.language,
    sandbox: {
      image: environment.sandbox.image,
      beforeAll: environment.sandbox.beforeAll,
    },
  }

  if (codeQuestionType === CodeQuestionType.codeWriting) {
    return {
      ...data,
      files: environment.codeWriting.files,
      testCases: environment.codeWriting.testCases,
    }
  } else if (codeQuestionType === CodeQuestionType.codeReading) {
    return {
      ...data,
      contextExec: environment.sandbox.exec,
      contextPath: environment.sandbox.defaultPath,
      context: environment.codeReading.context,
      snippets: environment.codeReading.snippets, // This is hypothetical; adjust based on your actual structure
    }
  }
}

export default withMethodHandler({
  GET: withAuthorization(withGroupScope(withPrisma(get)), [Role.PROFESSOR]),
  POST: withAuthorization(withGroupScope(withPrisma(post)), [Role.PROFESSOR]),
  DELETE: withAuthorization(withGroupScope(withPrisma(del)), [Role.PROFESSOR]),
})
