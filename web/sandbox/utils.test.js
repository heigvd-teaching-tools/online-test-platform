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
import { SandboxUnavailableError, isSandboxUnavailable } from './utils'

// error shapes below are the ones dockerode actually produces, observed against a
// closed port, an unresolvable host, a missing socket, a peer closing the connection
// and a real daemon
const dockerError = (message, properties) =>
  Object.assign(new Error(message), properties)

describe('isSandboxUnavailable', () => {
  describe('the docker daemon could not be reached', () => {
    it('detects a daemon that refuses connections', () => {
      const error = dockerError('connect ECONNREFUSED 172.18.0.4:2375', {
        code: 'ECONNREFUSED',
        syscall: 'connect',
      })
      expect(isSandboxUnavailable(error)).toBe(true)
    })

    it('detects an unresolvable docker host', () => {
      const error = dockerError('getaddrinfo EAI_AGAIN sandbox', {
        code: 'EAI_AGAIN',
        syscall: 'getaddrinfo',
      })
      expect(isSandboxUnavailable(error)).toBe(true)
    })

    it('detects a missing docker socket', () => {
      // what a developer gets when their local docker is not running
      const error = dockerError('connect ENOENT /var/run/docker.sock', {
        code: 'ENOENT',
        syscall: 'connect',
      })
      expect(isSandboxUnavailable(error)).toBe(true)
    })

    it('detects a connection lost in the middle of a request', () => {
      const error = dockerError('read ECONNRESET', {
        code: 'ECONNRESET',
        syscall: 'read',
      })
      expect(isSandboxUnavailable(error)).toBe(true)
    })

    it('detects a daemon that stops answering, which reports no syscall', () => {
      const error = dockerError('socket hang up', { code: 'ECONNRESET' })
      expect(isSandboxUnavailable(error)).toBe(true)
    })
  })

  describe('the docker daemon failed on its own side', () => {
    it('detects the overlay mount failure of a broken sandbox container', () => {
      // the failure reported in production: the sandbox lost its ability to mount
      // overlay filesystems, so the daemon can no longer create any container
      const error = dockerError(
        '(HTTP code 500) server error - error creating overlay mount to /var/lib/docker/overlay2/75bc5b1-init/merged: function not implemented ',
        { statusCode: 500 },
      )
      expect(isSandboxUnavailable(error)).toBe(true)
    })

    it('detects any other server side failure', () => {
      const error = dockerError('(HTTP code 503) server error', {
        statusCode: 503,
      })
      expect(isSandboxUnavailable(error)).toBe(true)
    })
  })

  describe('failures that are not outages', () => {
    it('does not flag a missing image, which the runners recover from by pulling', () => {
      const error = dockerError(
        '(HTTP code 404) no such container - No such image: node:latest ',
        { statusCode: 404 },
      )
      expect(isSandboxUnavailable(error)).toBe(false)
    })

    it('does not flag a request the daemon rejected as invalid', () => {
      const error = dockerError(
        '(HTTP code 400) bad parameter - Minimum memory limit allowed is 6MB ',
        { statusCode: 400 },
      )
      expect(isSandboxUnavailable(error)).toBe(false)
    })

    it('does not flag a missing file, which is a bug on our side', () => {
      // same error code as a missing docker socket, different syscall
      const error = dockerError(
        "ENOENT: no such file or directory, open 'code.tar.gz'",
        {
          code: 'ENOENT',
          syscall: 'open',
        },
      )
      expect(isSandboxUnavailable(error)).toBe(false)
    })

    it('does not flag a compilation failure', () => {
      expect(
        isSandboxUnavailable(
          new Error('main.c:3:5: error: expected declaration'),
        ),
      ).toBe(false)
    })

    it('does not flag an execution timeout', () => {
      expect(
        isSandboxUnavailable(new Error('Execution Timeout (t > 5000ms)')),
      ).toBe(false)
    })

    it('does not flag a missing error', () => {
      expect(isSandboxUnavailable(undefined)).toBe(false)
      expect(isSandboxUnavailable(null)).toBe(false)
    })
  })

  it('recognises an outage it already raised itself', () => {
    const error = new SandboxUnavailableError(new Error('socket hang up'))
    expect(isSandboxUnavailable(error)).toBe(true)
  })
})

describe('SandboxUnavailableError', () => {
  it('keeps the original failure as its cause', () => {
    const cause = new Error('connect ECONNREFUSED 172.18.0.4:2375')
    const error = new SandboxUnavailableError(cause)

    expect(error.name).toBe('SandboxUnavailableError')
    expect(error.cause).toBe(cause)
    expect(error.message).toContain('connect ECONNREFUSED 172.18.0.4:2375')
  })
})
