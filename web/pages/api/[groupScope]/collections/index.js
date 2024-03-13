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
/**
 *
 * Managing the collections of a group
 *
 * get: list collections of a group
 * post: create a new collection
 */
const get = async (req, res, prisma) => {
  const { groupScope } = req.query

  const collections = await prisma.collection.findMany({
    include: {
      collectionToQuestions: {
        orderBy: {
          order: 'asc',
        },
      },
    },
    where: {
      group: {
        scope: groupScope,
      },
    },
  })
  res.status(200).json(collections)
}

const post = async (req, res, prisma) => {
  const { groupScope } = req.query
  const { label, description } = req.body

  try {
    const collection = await prisma.collection.create({
      data: {
        label,
        description,
        group: {
          connect: {
            scope: groupScope,
          },
        },
      },
    })
    res.status(200).json(collection)
  } catch (e) {
    switch (e.code) {
      case 'P2002':
        res.status(409).json({ message: 'Collection already exists' })
        break
      default:
        res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default withMethodHandler({
  GET: withAuthorization(withGroupScope(withPrisma(get)), [Role.PROFESSOR]),
  POST: withAuthorization(withGroupScope(withPrisma(post)), [Role.PROFESSOR]),
})
