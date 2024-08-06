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
import { Role } from '@prisma/client'
import {
  withAuthorization,
  withGroupScope,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { withCollectionUpdate } from '@/middleware/withUpdate'
import { questionIncludeClause } from '@/code/questions'

/*

 endpoints used for collection compose. Managing questions in a copllection
  post: add a question to a collection
  put: update the points of a question in a collection
  delete: remove a question from a collection
 endpoint used by the autocomplete collection selector
  get: get all shallow questions in a collection -> used by autocomplete when creating a evaluation (s collection selector)
*/

const get = async (req, res, prisma) => {
  // get all questions in a collection, only shallow question data for counting purposes
  const { collectionId } = req.query

  const { groupScope } = req.query

  const questions = await prisma.collectionToQuestion.findMany({
    where: {
      collectionId: collectionId,
      collection: {
        group: {
          scope: groupScope,
        },
      },
    },
    include: {
      question: true,
    },
    orderBy: {
      order: 'asc',
    },
  })

  res.status(200).json(questions)
}

const post = async (req, res, prisma) => {
  // add a new question to a collection
  const { collectionId } = req.query
  const { questionId } = req.body

  // get the order of the question in the collection
  const order = await prisma.collectionToQuestion.count({
    where: {
      collectionId: collectionId,
    },
  })

  // In case this question was already used in another collection, fine the last points assigned to it
  const latestPoints = await prisma.collectionToQuestion.findFirst({
    where: {
      questionId: questionId,
    },
    orderBy: {
      order: 'desc',
    },
  })

  const points = latestPoints ? latestPoints.points : undefined

  const collectionToQuestion = await prisma.collectionToQuestion.create({
    data: {
      collectionId: collectionId,
      questionId: questionId,
      points: points,
      order: order,
    },
    include: {
      question: {
        include: questionIncludeClause({
          includeTypeSpecific: true,
          includeOfficialAnswers: false,
        }),
      },
    },
  })

  // using default value for points

  res.status(200).json(collectionToQuestion)
}

const put = async (req, res, prisma) => {
  // update the collectionToQuestion
  const { collectionToQuestion } = req.body

  await prisma.collectionToQuestion.update({
    where: {
      collectionId_questionId: {
        collectionId: collectionToQuestion.collectionId,
        questionId: collectionToQuestion.questionId,
      },
    },
    data: {
      points: parseFloat(collectionToQuestion.points),
    },
  })

  res.status(200).json({ message: 'OK' })
}

const del = async (req, res, prisma) => {
  // delete a question from a collection
  const { collectionId } = req.query
  const { questionId } = req.body

  // get the order of this question in the collection
  const order = await prisma.collectionToQuestion.findFirst({
    where: {
      AND: [{ collectionId: collectionId }, { questionId: questionId }],
    },
    orderBy: {
      order: 'asc',
    },
  })

  await prisma.$transaction(async (prisma) => {
    // delete the collectionToQuestion
    await prisma.collectionToQuestion.delete({
      where: {
        collectionId_questionId: {
          collectionId: collectionId,
          questionId: questionId,
        },
      },
    })

    // decrement the order of all questions that were after the deleted question
    await prisma.collectionToQuestion.updateMany({
      where: {
        AND: [{ collectionId: collectionId }, { order: { gt: order.order } }],
      },
      data: {
        order: {
          decrement: 1,
        },
      },
    })
  })

  res.status(200).json({ message: 'OK' })
}

export default withGroupScope(
  withMethodHandler({
    GET: withAuthorization(withPrisma(get), [Role.PROFESSOR]),
    POST: withAuthorization(withCollectionUpdate(withPrisma(post)), [
      Role.PROFESSOR,
    ]),
    PUT: withAuthorization(withCollectionUpdate(withPrisma(put)), [
      Role.PROFESSOR,
    ]),
    DELETE: withAuthorization(withCollectionUpdate(withPrisma(del)), [
      Role.PROFESSOR,
    ]),
  }),
)
