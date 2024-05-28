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
import { questionIncludeClause } from '@/code/questions'
import {
  withAuthorization,
  withGroupScope,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'

/*
 collection compose - collection content (list of questions), delete collection, update collection label

 get: get a collection with its questions -> used by the collection compose

*/

const get = async (req, res, prisma) => {
  const { collectionId } = req.query

  const collectionWithQuestions = await prisma.collection.findUnique({
    where: {
      id: collectionId,
    },
    include: {
      collectionToQuestions: {
        include: {
          question: {
            include: questionIncludeClause({
              includeTypeSpecific: true,
              includeOfficialAnswers: false,
            }),
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  })
  res.status(200).json(collectionWithQuestions)
}

const put = async (req, res, prisma) => {
  const { collectionId } = req.query
  const { collection } = req.body

  const updated = await prisma.collection.update({
    where: {
      id: collectionId,
    },
    data: {
      label: collection.label,
    },
  })

  res.status(200).json(updated)
}

const del = async (req, res, prisma) => {
  const { collectionId } = req.query
  const collection = await prisma.collection.delete({
    where: {
      id: collectionId,
    },
  })
  res.status(200).json(collection)
}

export default withMethodHandler({
  GET: withAuthorization(withGroupScope(withPrisma(get)), [Role.PROFESSOR]),
  PUT: withAuthorization(withGroupScope(withPrisma(put)), [Role.PROFESSOR]),
  DELETE: withAuthorization(withGroupScope(withPrisma(del)), [Role.PROFESSOR]),
})
