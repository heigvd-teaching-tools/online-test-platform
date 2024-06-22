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
import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Stack, Typography } from '@mui/material'
import Overlay from '../ui/Overlay'
import StatusDisplay from '../feedback/StatusDisplay'
import { fetcher } from '@/code/utils'

const PING_INTERVAL = 5000 // Interval to check connection in milliseconds
const CHECK_URL = '/api/conn_check' // URL to test connection

const ConnectionCheck = () => {
  const [isOnline, setIsOnline] = useState(true)

  const { data, error } = useSWR(CHECK_URL, fetcher, {
    refreshInterval: PING_INTERVAL,
    shouldRetryOnError: true,
  })

  const setOnline = () => setIsOnline(true)
  const setOffline = () => setIsOnline(false)

  useEffect(() => {
    if (navigator.onLine) {
      setOnline()
    } else {
      setOffline()
    }

    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOffline)

    return () => {
      window.removeEventListener('online', setOnline)
      window.removeEventListener('offline', setOffline)
    }
  }, [])

  useEffect(() => {
    if (error) {
      setOffline()
    } else {
      setOnline()
    }
  }, [data, error])

  return (
    <>
      {!isOnline && (
        <Overlay>
          <Stack alignItems={'center'} spacing={2} justifyContent={'center'}>
            <StatusDisplay size={96} status={'WIFI-OFF'} />
            <Typography variant="h4" color="error">
              Connection lost
            </Typography>
          </Stack>
        </Overlay>
      )}
    </>
  )
}

export default ConnectionCheck
