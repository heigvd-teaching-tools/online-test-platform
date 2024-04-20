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
import { withQuestionUpdate } from '@/middleware/withUpdate'

/**
 * Managing tags of a question
 * get: list tags of a question
 * put: update tags of a question
 */

const get = async (req, res, prisma) => {
  const { questionId } = req.query

  // get all tags linked to this question
  const tags = await prisma.questionToTag.findMany({
    where: {
      questionId: questionId,
    },
    include: {
      tag: true,
    },
  })

  res.status(200).json(tags)
}

const put = async (req, res, prisma) => {
  const { groupScope } = req.query

  const { tags } = req.body

  const { questionId } = req.query

  const transaction = [
    // unlink all tags from this question
    prisma.questionToTag.deleteMany({
      where: {
        questionId: questionId,
      },
    }),
    // create eventual new tags
    ...tags.map((tag) =>
      prisma.tag.upsert({
        where: {
          label: tag,
        },
        update: {},
        create: {
          label: tag,
          group: {
            connect: {
              scope: groupScope,
            },
          },
        },
      }),
    ),
    // link all tags to this question
    ...tags.map((tag) =>
      prisma.questionToTag.create({
        data: {
          questionId: questionId,
          label: tag,
        },
      }),
    ),
    // delete tags that are not linked to any question
    prisma.tag.deleteMany({
      where: {
        questionToTag: {
          none: {},
        },
        group: {
          scope: groupScope,
        },
      },
    }),
  ]

  const response = await prisma.$transaction(transaction)

  res.status(200).json(response)
}

export default withMethodHandler({
  GET: withAuthorization(withGroupScope(withPrisma(get)), [Role.PROFESSOR]),
  PUT: withAuthorization(withGroupScope(withQuestionUpdate(withPrisma(put))), [
    Role.PROFESSOR,
  ]),
})
