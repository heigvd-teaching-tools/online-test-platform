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
import { getUser } from '@/code/auth'
import {
  withAuthorization,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import {
  withEvaluationPhase,
  withStudentStatus,
} from '@/middleware/withStudentEvaluation'
import { EvaluationPhase, Role, UserOnEvaluationStatus } from '@prisma/client'

const get = async (req, res, prisma) => {
  const user = await getUser(req, res)
  const studentEmail = user.email

  const { evaluationId } = req.query

  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },
    select: {
      phase: true,
      startAt: true,
      endAt: true,
    },
  })

  const userOnEvaluation = await prisma.userOnEvaluation.findUnique({
    where: {
      userEmail_evaluationId: {
        userEmail: studentEmail,
        evaluationId: evaluationId,
      },
    },
  })

  res.status(200).json({
    evaluation: evaluation,
    userOnEvaluation: userOnEvaluation,
  })
}

// student ends his evaluation
const put = withEvaluationPhase(
  [EvaluationPhase.IN_PROGRESS],
  withStudentStatus(
    [UserOnEvaluationStatus.IN_PROGRESS],
    async (req, res, prisma) => {
      const user = await getUser(req, res)
      const studentEmail = user.email
      const { evaluationId } = req.query

      await prisma.userOnEvaluation.update({
        where: {
          userEmail_evaluationId: {
            userEmail: studentEmail,
            evaluationId: evaluationId,
          },
        },
        data: {
          status: UserOnEvaluationStatus.FINISHED,
          finishedAt: new Date(),
        },
      })

      res.status(200).json({ message: 'Evaluation completed' })
    },
  ),
)

export default withMethodHandler({
  GET: withAuthorization(withPrisma(get), [Role.PROFESSOR, Role.STUDENT]),
  PUT: withAuthorization(withPrisma(put), [Role.PROFESSOR, Role.STUDENT]),
})
