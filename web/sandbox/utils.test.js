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
import { SandboxOutageError, isSandboxOutage } from './utils'

// error shapes below are the ones dockerode actually produces, observed against a
// closed port, an unresolvable host, a missing socket, a peer closing the connection
// and a real daemon
const dockerError = (message, properties) =>
  Object.assign(new Error(message), properties)

describe('isSandboxOutage', () => {
  describe('the docker daemon could not be reached', () => {
    it('detects a daemon that refuses connections', () => {
      const error = dockerError('connect ECONNREFUSED 172.18.0.4:2375', {
        code: 'ECONNREFUSED',
        syscall: 'connect',
      })
      expect(isSandboxOutage(error)).toBe(true)
    })

    it('detects an unresolvable docker host', () => {
      const error = dockerError('getaddrinfo EAI_AGAIN sandbox', {
        code: 'EAI_AGAIN',
        syscall: 'getaddrinfo',
      })
      expect(isSandboxOutage(error)).toBe(true)
    })

    it('detects a missing docker socket', () => {
      // what a developer gets when their local docker is not running
      const error = dockerError('connect ENOENT /var/run/docker.sock', {
        code: 'ENOENT',
        syscall: 'connect',
      })
      expect(isSandboxOutage(error)).toBe(true)
    })

    it('detects a connection lost in the middle of a request', () => {
      const error = dockerError('read ECONNRESET', {
        code: 'ECONNRESET',
        syscall: 'read',
      })
      expect(isSandboxOutage(error)).toBe(true)
    })

    it('detects a daemon that stops answering, which reports no syscall', () => {
      const error = dockerError('socket hang up', { code: 'ECONNRESET' })
      expect(isSandboxOutage(error)).toBe(true)
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
      expect(isSandboxOutage(error)).toBe(true)
    })

    it('detects any other server side failure', () => {
      const error = dockerError('(HTTP code 503) server error', {
        statusCode: 503,
      })
      expect(isSandboxOutage(error)).toBe(true)
    })
  })

  describe('failures that are not outages', () => {
    it('does not flag a missing image, which the runners recover from by pulling', () => {
      const error = dockerError(
        '(HTTP code 404) no such container - No such image: node:latest ',
        { statusCode: 404 },
      )
      expect(isSandboxOutage(error)).toBe(false)
    })

    it('does not flag a request the daemon rejected as invalid', () => {
      const error = dockerError(
        '(HTTP code 400) bad parameter - Minimum memory limit allowed is 6MB ',
        { statusCode: 400 },
      )
      expect(isSandboxOutage(error)).toBe(false)
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
      expect(isSandboxOutage(error)).toBe(false)
    })

    it('does not flag a compilation failure', () => {
      expect(
        isSandboxOutage(new Error('main.c:3:5: error: expected declaration')),
      ).toBe(false)
    })

    it('does not flag an execution timeout', () => {
      expect(isSandboxOutage(new Error('Execution Timeout (t > 5000ms)'))).toBe(
        false,
      )
    })

    it('does not flag a missing error', () => {
      expect(isSandboxOutage(undefined)).toBe(false)
      expect(isSandboxOutage(null)).toBe(false)
    })
  })

  it('recognises an outage it already raised itself', () => {
    const error = new SandboxOutageError(new Error('socket hang up'))
    expect(isSandboxOutage(error)).toBe(true)
  })
})

describe('isSandboxOutage, on failures that hide the original error', () => {
  it('detects an aggregated connection failure, which carries no syscall', () => {
    // what node reports when a dual stack host fails to connect on every address
    const error = Object.assign(new AggregateError([], ''), {
      code: 'ECONNREFUSED',
    })
    expect(isSandboxOutage(error)).toBe(true)
  })

  it('looks into the errors an aggregate is made of', () => {
    const refused = Object.assign(new Error('connect ECONNREFUSED ::1:2375'), {
      code: 'ECONNREFUSED',
      syscall: 'connect',
    })
    expect(isSandboxOutage(new AggregateError([refused], ''))).toBe(true)
  })

  it('looks into the cause of a wrapped failure', () => {
    const cause = Object.assign(
      new Error('connect ECONNREFUSED 172.18.0.4:2375'),
      {
        code: 'ECONNREFUSED',
        syscall: 'connect',
      },
    )
    expect(
      isSandboxOutage(new Error('Failed to start container', { cause })),
    ).toBe(true)
  })

  it('does not follow a cause that refers back to itself', () => {
    const error = new Error('nothing useful here')
    error.cause = error
    expect(isSandboxOutage(error)).toBe(false)
  })
})

describe('SandboxOutageError', () => {
  it('keeps the original failure as its cause', () => {
    const cause = new Error('connect ECONNREFUSED 172.18.0.4:2375')
    const error = new SandboxOutageError(cause)

    expect(error.name).toBe('SandboxOutageError')
    expect(error.cause).toBe(cause)
    expect(error.message).toContain('connect ECONNREFUSED 172.18.0.4:2375')
  })
})
