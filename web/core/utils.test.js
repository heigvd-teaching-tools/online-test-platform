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

import { describe, it, expect } from 'vitest'
import { readSandboxRun } from './utils'

const answer = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
})

describe('readSandboxRun', () => {
  it('returns the run when the sandbox answered one', async () => {
    const run = { beforeAll: 'compiled', tests: [{ passed: true }] }

    await expect(readSandboxRun(answer(200, run))).resolves.toEqual(run)
  })

  it('refuses to pass an outage off as a run', async () => {
    // without this, callers read tests as undefined and carry on as if nothing happened
    await expect(
      readSandboxRun(
        answer(503, { message: 'Code execution is temporarily unavailable' }),
      ),
    ).rejects.toMatchObject({
      status: 503,
      message: 'Code execution is temporarily unavailable',
    })
  })

  it('carries the status, which is how callers tell it from a lost connection', async () => {
    // a fetch that never reached the server rejects without one
    await expect(
      readSandboxRun(answer(500, { message: 'Internal server error' })),
    ).rejects.toHaveProperty('status')
  })
})
