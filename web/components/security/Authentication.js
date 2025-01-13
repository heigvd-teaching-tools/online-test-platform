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
import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import LoadingAnimation from '../feedback/Loading'
import LoginScreen from './LoginScreen'
import OrganizationSelector from './OrganizationSelector'
import { Stack } from '@mui/system'
import { Typography } from '@mui/material'

const Authentication = ({ children }) => {
  const { data: session, status, update } = useSession()

  useEffect(() => {
    let eventSource

    if (status === 'authenticated') {
      console.log('Opening SSE connection')

      // Open the SSE connection
      eventSource = new EventSource('/api/session-sse')

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.status === 'unauthenticated') {
          signOut()
          eventSource.close()
        }
      }

      eventSource.onerror = (err) => {
        console.error('EventSource error:', err)
        eventSource.close()
      }
    }

    // Cleanup on component unmount or status change
    return () => {
      if (eventSource) {
        console.log('Closing SSE connection')
        eventSource.close()
      }
    }
  }, [status])

  if (status === 'loading') return <LoadingAnimation />
  if (status === 'unauthenticated') return <LoginScreen />

  if (status === 'authenticated') {
    if (!session.user.selectedOrganization) {
      return (
        <Stack
          width="100vw"
          height="100vh"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="h6" gutterBottom>
            Please select your organization
          </Typography>
          <OrganizationSelector
            organizations={session.user.organizations}
            onChanged={async () => {
              await update()
            }}
          />
        </Stack>
      )
    }

    return children
  }

  return null // Fallback if status is something unexpected
}

export default Authentication
