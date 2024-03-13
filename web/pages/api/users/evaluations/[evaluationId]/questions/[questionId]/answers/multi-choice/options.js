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
  EvaluationPhase,
  Role,
  StudentAnswerStatus,
  UserOnEvaluationStatus,
} from '@prisma/client'

import { grading } from '@/code/grading'
import {
  withAuthorization,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import {
  withEvaluationPhase,
  withStudentStatus,
} from '@/middleware/withStudentEvaluation'
import { getUser } from '@/code/auth'

const addOrRemoveOption = withEvaluationPhase(
  [EvaluationPhase.IN_PROGRESS],
  withStudentStatus(
    [UserOnEvaluationStatus.IN_PROGRESS],
    async (req, res, prisma) => {
      const user = await getUser(req, res)
      const studentEmail = user.email
      const { evaluationId, questionId } = req.query

      const toAdd = req.method === 'POST'

      const { option } = req.body

      // get all options including their official answer status,
      // these are used to grade the users answers
      // WARNING! they should not be returned by the api to the users
      const evaluationToQuestion = await prisma.evaluationToQuestion.findUnique(
        {
          where: {
            evaluationId_questionId: {
              evaluationId: evaluationId,
              questionId: questionId,
            },
          },
          include: {
            question: {
              include: {
                multipleChoice: {
                  select: {
                    options: true,
                  },
                },
              },
            },
          },
        }
      )

      if (!evaluationToQuestion) {
        res.status(400).json({ message: 'Internal Server Error' })
        return
      }

      let status = StudentAnswerStatus.IN_PROGRESS

      if (!toAdd) {
        // toRemove
        // check if the option to remove is the only one selected, if so, set status to missing
        const studentAnswer =
          await prisma.studentAnswerMultipleChoice.findUnique({
            where: {
              userEmail_questionId: {
                userEmail: studentEmail,
                questionId: questionId,
              },
            },
            select: {
              options: {
                select: {
                  id: true,
                  text: true,
                },
              },
            },
          })

        if (studentAnswer.options.length === 1) {
          status = StudentAnswerStatus.MISSING
        }
      }

      const transaction = [] // to do in single transaction, queries are done in order

      // update the status of the users answers
      transaction.push(
        prisma.studentAnswer.update({
          where: {
            userEmail_questionId: {
              userEmail: studentEmail,
              questionId: questionId,
            },
          },
          data: {
            status,
          },
        })
      )

      // add option to users multi-choice answers
      transaction.push(
        prisma.studentAnswerMultipleChoice.update({
          where: {
            userEmail_questionId: {
              userEmail: studentEmail,
              questionId: questionId,
            },
          },
          data: {
            options: {
              [toAdd ? 'connect' : 'disconnect']: {
                id: option.id,
              },
            },
          },
        })
      )

      // prisma transaction
      await prisma.$transaction(transaction)

      // get the updated users answers
      const studentAnswer = await prisma.studentAnswerMultipleChoice.findUnique(
        {
          where: {
            userEmail_questionId: {
              userEmail: studentEmail,
              questionId: questionId,
            },
          },
          select: {
            options: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        }
      )

      // grade the users answers
      await prisma.studentQuestionGrading.upsert({
        where: {
          userEmail_questionId: {
            userEmail: studentEmail,
            questionId: questionId,
          },
        },
        create: {
          userEmail: studentEmail,
          questionId: questionId,
          ...grading(
            evaluationToQuestion.question,
            evaluationToQuestion.points,
            studentAnswer
          ),
        },
        update: grading(
          evaluationToQuestion.question,
          evaluationToQuestion.points,
          studentAnswer
        ),
      })

      // get the updated users answers -> do not return the options official answer status "isCorerct"
      const updatedStudentAnswer = await prisma.studentAnswer.findUnique({
        where: {
          userEmail_questionId: {
            userEmail: studentEmail,
            questionId: questionId,
          },
        },
        select: {
          status: true,
          multipleChoice: {
            include: {
              options: {
                select: {
                  id: true,
                  text: true,
                },
              },
            },
          },
        },
      })

      res.status(200).json(updatedStudentAnswer)
    }
  )
)

export default withMethodHandler({
  POST: withAuthorization(withPrisma(addOrRemoveOption), [
    Role.PROFESSOR,
    Role.STUDENT,
  ]),
  DELETE: withAuthorization(withPrisma(addOrRemoveOption), [
    Role.PROFESSOR,
    Role.STUDENT,
  ]),
})
