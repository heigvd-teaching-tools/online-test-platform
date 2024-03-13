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
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { IncludeStrategy, questionIncludeClause } from '@/code/questions'
/*
  Professor can consult the users's answers to the questions of a evaluation
*/
const get = async (req, res, prisma) => {
  const { evaluationId, userEmail } = req.query

  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },
    include: {
      evaluationToQuestions: {
        include: {
          question: {
            include: questionIncludeClause({
              includeTypeSpecific: true,
              includeOfficialAnswers: true,
              includeUserAnswers: {
                strategy: IncludeStrategy.USER_SPECIFIC,
                userEmail: userEmail,
              },
              includeGradings: true,
            }),
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  })
  res.status(200).json(evaluation)
}

export default withMethodHandler({
  GET: withAuthorization(withPrisma(get), [Role.PROFESSOR]),
})
