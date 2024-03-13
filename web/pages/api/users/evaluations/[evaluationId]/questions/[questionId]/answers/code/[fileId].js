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
import { withPrisma } from '@/middleware/withPrisma'
import {
  withAuthorization,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import {
  withEvaluationPhase,
  withStudentStatus,
} from '@/middleware/withStudentEvaluation'
import { getUser } from '@/code/auth'
/*
  Student updated a code file during a ham session

*/
const put = withEvaluationPhase(
  [EvaluationPhase.IN_PROGRESS],
  withStudentStatus(
    [UserOnEvaluationStatus.IN_PROGRESS],
    async (req, res, prisma) => {
      const user = await getUser(req, res)
      const studentEmail = user.email
      const { evaluationId, questionId, fileId } = req.query

      const { file } = req.body

      const evaluationToQuestion = await prisma.evaluationToQuestion.findUnique(
        {
          where: {
            evaluationId_questionId: {
              evaluationId: evaluationId,
              questionId: questionId,
            },
          },
          include: {
            question: true,
          },
        }
      )

      if (!evaluationToQuestion) {
        res.status(400).json({ message: 'Question not found' })
        return
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
            status: StudentAnswerStatus.IN_PROGRESS,
          },
        })
      )

      // update the users answers file for code question
      transaction.push(
        prisma.studentAnswerCodeToFile.update({
          where: {
            userEmail_questionId_fileId: {
              userEmail: studentEmail,
              questionId: questionId,
              fileId: fileId,
            },
          },
          data: {
            file: {
              update: {
                content: file.content,
              },
            },
          },
        })
      )

      // grade question
      transaction.push(
        prisma.studentQuestionGrading.upsert({
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
              undefined
            ),
          },
          update: grading(
            evaluationToQuestion.question,
            evaluationToQuestion.points,
            undefined
          ),
        })
      )

      // prisma transaction
      await prisma.$transaction(transaction)

      const updatedAnswer = await prisma.studentAnswer.findUnique({
        where: {
          userEmail_questionId: {
            userEmail: studentEmail,
            questionId: questionId,
          },
        },
        select: {
          status: true,
          code: {
            select: {
              files: {
                select: {
                  file: true,
                },
              },
            },
          },
        },
      })
      res.status(200).json(updatedAnswer)
    }
  )
)

export default withMethodHandler({
  PUT: withAuthorization(withPrisma(put), [Role.PROFESSOR, Role.STUDENT]),
})
