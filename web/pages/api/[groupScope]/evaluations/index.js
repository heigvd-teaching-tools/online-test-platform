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
  EvaluationPhase,
  UserOnEvaluationAccessMode,
} from '@prisma/client'
import { withPrisma } from '@/middleware/withPrisma'
import {
  withAuthorization,
  withGroupScope,
  withMethodHandler,
} from '@/middleware/withAuthorization'

const get = async (req, res, prisma) => {
  // shallow session to question get -> we just need to count the number of questions
  const { groupScope } = req.query

  const evaluations = await prisma.evaluation.findMany({
    where: {
      group: {
        scope:  groupScope,
      },
    },
    include: {
      evaluationToQuestions: {
        select: {
          question: {
            include: {
              sourceQuestion: true,
            },
          },
          points: true,
          order: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
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
 * */
const post = async (req, res, prisma) => {
  const { groupScope } = req.query

  const {
    preset: { value: presetType, settings },
    templateEvaluation,
  } = req.body

  let data = {
    phase: EvaluationPhase.DRAFT,
    group: {
      connect: {
        scope: groupScope,
      },
    },
  }

  if (presetType === 'from_existing') {
    data = {
      ...data,
      label: `Copy of ${templateEvaluation.label}`,
      accessMode: templateEvaluation.accessMode,
      accessList: templateEvaluation.accessList,
      durationHours: templateEvaluation.durationHours,
      durationMins: templateEvaluation.durationMins,
      showSolutionsWhenFinished: templateEvaluation.showSolutionsWhenFinished,
    }
  } else {
    data = {
      ...data,
      label: '',
      showSolutionsWhenFinished: settings.showSolutionsWhenFinished,
      accessMode: settings.restrictAccess
        ? UserOnEvaluationAccessMode.LINK_ONLY
        : UserOnEvaluationAccessMode.FREE_ACCESS,
    }
  }

  try {
    let evaluation = undefined
    await prisma.$transaction(async (prisma) => {
      evaluation = await prisma.evaluation.create({ data })

      if (presetType === 'from_existing') {
        // Attach all of the SOURCE questions from the template evaluation to the new evaluation

        const templateQuestions = templateEvaluation.evaluationToQuestions

        for (const templateToQuestion of templateQuestions) {
          if (templateToQuestion.question.sourceQuestion === null) {
            // skip questions that original no longer exists
            continue
          }

          // create relation between evaluation and a source question
          await prisma.evaluationToQuestion.create({
            data: {
              points: templateToQuestion.points,
              order: templateToQuestion.order,
              evaluation: {
                connect: {
                  id: evaluation.id,
                },
              },
              question: {
                connect: {
                  id: templateToQuestion.question.sourceQuestion.id,
                },
              },
            },
          })
        }
      }

      /*Legacy 
      
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
      
      */
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
