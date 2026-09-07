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

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { withApiContext } from './withApiContext'
import { SandboxOutageError } from '@/sandbox/utils'
import { getUser } from '@/core/auth/auth'

vi.mock('@/core/auth/auth', () => ({ getUser: vi.fn() }))
vi.mock('@/core/hooks/usePrisma', () => ({ getPrismaClient: () => ({}) }))

describe('withApiContext', () => {
  let req, res

  beforeEach(() => {
    vi.clearAllMocks()
    // the outage path logs the cause on purpose, which would drown the test output
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getUser.mockResolvedValue({ email: 'student@heig-vd.ch' })
    req = { method: 'POST' }
    res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() }
  })

  describe('when the sandbox is down', () => {
    it('answers 503 rather than letting the failure become a 500', async () => {
      const handler = vi
        .fn()
        .mockRejectedValue(new SandboxOutageError(new Error('boom')))

      await withApiContext({ POST: handler })(req, res)

      expect(res.status).toHaveBeenCalledWith(503)
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('temporarily unavailable'),
      })
    })

    it('never puts the underlying docker error in the answer', async () => {
      // this is what used to reach students, naming a kernel call they cannot act on
      const cause = new Error(
        '(HTTP code 500) server error - error creating overlay mount: function not implemented',
      )
      const handler = vi.fn().mockRejectedValue(new SandboxOutageError(cause))

      await withApiContext({ POST: handler })(req, res)

      const [answer] = res.json.mock.calls[0]
      expect(answer.message).not.toContain('overlay')
      expect(Object.keys(answer)).toEqual(['message'])
    })
  })

  describe('every other outcome is untouched', () => {
    it('lets an unrelated failure through', async () => {
      const failure = new Error('a bug of ours')
      const handler = vi.fn().mockRejectedValue(failure)

      await expect(withApiContext({ POST: handler })(req, res)).rejects.toBe(
        failure,
      )
      expect(res.status).not.toHaveBeenCalled()
    })

    it('returns what the handler returned', async () => {
      const handler = vi.fn().mockResolvedValue('answered')

      await expect(withApiContext({ POST: handler })(req, res)).resolves.toBe(
        'answered',
      )
    })

    it('still refuses a method it does not handle', async () => {
      await withApiContext({ GET: vi.fn() })(req, res)
      expect(res.status).toHaveBeenCalledWith(405)
    })

    it('still refuses an unauthenticated caller', async () => {
      getUser.mockResolvedValue(null)

      await withApiContext({ POST: vi.fn() })(req, res)
      expect(res.status).toHaveBeenCalledWith(401)
    })
  })
})
