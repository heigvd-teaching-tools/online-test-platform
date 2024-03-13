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
  StudentAnswerStatus,
  EvaluationPhase,
  UserOnEvaluationStatus,
} from '@prisma/client'

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

/*
 endpoint to handle users answers submission status
  PUT : Set the answer status to SUBMITTED
  DELETE : Set the answer status to IN_PROGRESS
*/

const put = withEvaluationPhase(
  [EvaluationPhase.IN_PROGRESS],
  withStudentStatus(
    [UserOnEvaluationStatus.IN_PROGRESS],
    async (req, res, prisma) => {
      // update users answers
      const user = await getUser(req, res)
      const studentEmail = user.email
      const { questionId } = req.query

      // Update the StudentAnswer status to SUBMITTED
      await prisma.studentAnswer.update({
        where: {
          userEmail_questionId: {
            userEmail: studentEmail,
            questionId: questionId,
          },
        },
        data: {
          status: StudentAnswerStatus.SUBMITTED,
        },
      })

      res.status(200).json({ message: 'Answer submitted' })
    }
  )
)

const del = withEvaluationPhase(
  [EvaluationPhase.IN_PROGRESS],
  withStudentStatus(
    [UserOnEvaluationStatus.IN_PROGRESS],
    async (req, res, prisma) => {
      // update users answers
      const user = await getUser(req, res)
      const studentEmail = user.email
      const { questionId } = req.query

      // Update the StudentAnswer status to IN_PROGRESS
      await prisma.studentAnswer.update({
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

      res.status(200).json({ message: 'Answer status updated' })
    }
  )
)

export default withMethodHandler({
  PUT: withAuthorization(withPrisma(put), [Role.STUDENT, Role.PROFESSOR]),
  DELETE: withAuthorization(withPrisma(del), [Role.STUDENT, Role.PROFESSOR]),
})
