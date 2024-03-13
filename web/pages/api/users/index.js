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
import { getUser } from '@/code/auth'

/**
 *
 * Search for users
 * Used by SuperAdmin page and  AutoComplete Search Component when adding a professor to a group
 */
const get = async (req, res, prisma) => {
  const { search, role } = req.query

  if (!role) {
    // only super admin can view all users
    const user = await getUser(req, res)
    if (
      (!search || search.length < 2) &&
      !user.roles.includes(Role.SUPER_ADMIN)
    ) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }
  }

  const roleCondition =
    role && Role[role]
      ? {
          roles: {
            has: Role[role],
          },
        }
      : {}

  const searchCondition =
    search && search.length >= 2
      ? {
          OR: [
            // OR applies on the array of conditions
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}

  const users = await prisma.user.findMany({
    where: {
      ...roleCondition,
      ...searchCondition,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      roles: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  res.status(200).json(users)
}

export default withMethodHandler({
  GET: withAuthorization(withPrisma(get), [Role.PROFESSOR, Role.SUPER_ADMIN]),
})
