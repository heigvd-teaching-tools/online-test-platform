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
import { getRoles, getUser } from '../code/auth'
import { getPrisma } from './withPrisma'

/**
Group owned entities are entities that are owned by a group. 

- Collection
- Evaluation
- Question
- Tag

When the entity or any of its related entities are concerned, we must ensure that the user is the member of that group.

*/
const EntityNameQueryStringIdPair = Object.freeze({
  Question: 'questionId',
  Collection: 'collectionId',
  Evaluation: 'evaluationId',
  Tag: 'tagId',
})

/*
    Function to check if a users is member of the group
    for group scoped endpoints

    This function also checks 
    - if the entity is owned by the group
    - if the user is member of the group that owns the entity

    It automatically detects the entity usage based on the query string. 
    Important: Always use the singular form of the entity id variable name in the query string.
*/

export function withGroupScope(handler) {
  return async (req, res) => {
    const { groupScope } = req.query

    if (!groupScope) {
      return res.status(400).json({ message: 'Group scope is required' })
    }

    const user = await getUser(req, res)

    const isMember = user?.groups?.some((g) => g === groupScope)

    if (!isMember) {
      return res
        .status(401)
        .json({ message: 'You are not authorized to access this group' })
    }

    // Identify the entity name and ID from the query string
    const entityPair = Object.entries(EntityNameQueryStringIdPair).find(
      ([, queryStringId]) => req.query[queryStringId],
    )

    if (entityPair) {
      // A group owned entity or any of its related entities are concerned

      const [entityName, queryStringId] = entityPair

      const prisma = getPrisma()

      const entityId = req.query[queryStringId]

      if (!entityId) {
        return res.status(400).json({ message: 'Entity id is required' })
      }

      const entity = await prisma[entityName].findUnique({
        where: {
          id: entityId,
        },
        include: {
          group: true,
        },
      })

      if (!entity) {
        return res.status(404).json({ message: 'Entity not found' })
      }

      // Check if the entity group corresponds to the current group
      if (groupScope !== entity.group.scope) {
        return res.status(401).json({
          message: 'Entity does not belong to the group',
        })
      }

      // Check if the user is member of the group that owns the entity
      if (!user.groups.includes(entity.group.scope)) {
        return res.status(401).json({
          message: 'You are not authorized to access this entity',
        })
      }
    }

    return handler(req, res)
  }
}

export function withAuthorization(handler, allowedRoles) {
  return async (req, res) => {
    const userRoles = await getRoles(req, res)
    if (!userRoles) {
      return res
        .status(401)
        .json({ message: 'You must be logged in to access this page' })
    }
    const isAuthorized = userRoles.some((userRole) =>
      allowedRoles.includes(userRole),
    )

    if (!isAuthorized) {
      return res.status(401).json({
        message:
          'You must have one of the following roles: ' +
          allowedRoles.join(', '),
      })
    }

    return handler(req, res)
  }
}

export function withMethodHandler(methodHandlers) {
  return async (req, res) => {
    const handler = methodHandlers[req.method]
    if (!handler) {
      return res.status(405).json({ message: 'Method not allowed' })
    }

    await handler(req, res)
  }
}
