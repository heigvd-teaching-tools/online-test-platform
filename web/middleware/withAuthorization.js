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

/*
    Function to check if a users is member of the group
    for group scoped endpoints
*/

export function withGroupScope(handler) {
  return async (req, res) => {
    const { groupScope } = req.query

    if (!groupScope) {
      return res.status(400).json({ message: 'Group scope is required' })
    }

    const user = await getUser(req, res)

    const isMember = user.groups.some((g) => g === groupScope)
    // console.log("withGroupScope", req.method, req.url, "isMember", isMember, "groupScope", groupScope,  "userGroups [", user.groups.join(", "), "]")
    if (!isMember) {
      return res
        .status(401)
        .json({ message: 'You are not authorized to access this group' })
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
      allowedRoles.includes(userRole)
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
