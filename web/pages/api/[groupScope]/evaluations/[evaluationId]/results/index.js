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
import { withPrisma } from '@/middleware/withPrisma'
import {
  withMethodHandler,
  withAuthorization,
  withGroupScope,
} from '@/middleware/withAuthorization'
import { IncludeStrategy, questionIncludeClause } from '@/code/questions'

const get = async (req, res, prisma) => {
  const { evaluationId } = req.query
  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },
    select: {
      evaluationToQuestions: {
        select: {
          question: {
            include: questionIncludeClause({
              includeTypeSpecific: true,
              includeOfficialAnswers: true,
              includeUserAnswers: {
                strategy: IncludeStrategy.ALL,
              },
              includeGradings: true,
            }),
          },
          order: true,
          points: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  })
  res.status(200).json(evaluation.evaluationToQuestions)
}

export default withGroupScope(
  withMethodHandler({
    GET: withAuthorization(withPrisma(get), [Role.PROFESSOR]),
  }),
)
