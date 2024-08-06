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
import { Role, EvaluationPhase, QuestionSource } from '@prisma/client'
import { withPrisma } from '@/middleware/withPrisma'
import {
  withAuthorization,
  withGroupOwnedEntity,
  withGroupScope,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { copyQuestion, questionIncludeClause } from '@/code/questions'

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
The questions from the collection are all deep copied for the evaluation
The reason for this is that the questions in the collection can be changed after the evaluation is created
The evaluation must freeze the questions at the time of creation
The code questions are copied with all the files
The database questions are copied with all the queries and their outputs
* */
const post = async (req, res, prisma) => {
  const { label, conditions, duration, collectionId, accessMode, accessList } =
    req.body

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
    accessMode,
    accessList,
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

      // copy all of the questions from the collection to the evaluation
      for (const collectionToQuestion of collectionToQuestions) {
        // copy the question
        const newQuestion = await copyQuestion(
          prisma,
          collectionToQuestion.question,
          QuestionSource.EVAL,
        )
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
                id: newQuestion.id,
              },
            },
          },
        })
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

export default withGroupScope(
  withMethodHandler({
    GET: withAuthorization(withPrisma(get), [Role.PROFESSOR]),
    POST: withAuthorization(withPrisma(post), [Role.PROFESSOR]),
  }),
)
