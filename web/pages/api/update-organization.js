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
import { Role } from '@prisma/client'

const post = async (req, res, prisma) => {
  const { selectedOrganization } = req.body

  const user = await getUser(req, res)

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // check if the selected organization is in the list of organizations
  if (!user.organizations.includes(selectedOrganization)) {
    return res.status(400).json({ error: 'Invalid organization' })
  }

  // Update the user in the database
  await prisma.user.update({
    where: { id: user.id },
    data: { selectedOrganization },
  })

  return res.status(200).json({ data: { selectedOrganization } })
}

export default withMethodHandler({
  POST: withAuthorization(withPrisma(post), [
    Role.STUDENT,
    Role.PROFESSOR,
    Role.SUPER_ADMIN,
  ]),
})
