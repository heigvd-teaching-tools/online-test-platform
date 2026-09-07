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

import type { NextApiRequest, NextApiResponse } from 'next'
import type { IApiContext } from '@/core/types/api'
import { getPrismaClient } from '@/core/hooks/usePrisma'
import { getUser } from '@/core/auth/auth'
import { SandboxOutageError } from '@/sandbox/utils'

/*
Shown to whoever triggered a run the sandbox could not perform. It replaces the docker
error that used to reach students, which named a kernel call they have no way to act on.
*/
const SANDBOX_OUTAGE_MESSAGE =
  'Code execution is temporarily unavailable. Please try again, and let your teacher know if it persists.'

/* --------------------------------------------------------------------------
 * API Context Middleware

/**
 * Unified entry point for all authenticated API routes.
 * Builds:
 *   - Next.js req / res objects (passed as first two arguments)
 *   - raw NextAuth session user
 *   - prisma client
 *
 * Usage: req.query, req.body, res.status(200).json(), etc.
 */

export function withApiContext(handlers: Record<string, Function>) {
  return async (nextReq: NextApiRequest, nextRes: NextApiResponse) => {
    const handler = handlers[nextReq.method || '']
    if (!handler) {
      return nextRes.status(405).json({ message: 'Method not allowed' })
    }

    const rawUser = await getUser(nextReq, nextRes)
    if (!rawUser) {
      return nextRes.status(401).json({ message: 'Unauthorized' })
    }

    const ctx: IApiContext = {
      user: rawUser,
      prisma: getPrismaClient(),
    }

    try {
      return await handler(nextReq, nextRes, ctx)
    } catch (error) {
      // an outage is the one failure that is neither the caller's fault nor a bug, and
      // that callers must not record a result for
      if (!(error instanceof SandboxOutageError)) throw error

      console.error('Sandbox outage', error.cause)
      return nextRes.status(503).json({ message: SANDBOX_OUTAGE_MESSAGE })
    }
  }
}
