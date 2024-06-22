import React, { useState, useEffect } from 'react'
import { Stack, Typography } from '@mui/material'
import Overlay from '../ui/Overlay'
import StatusDisplay from '../feedback/StatusDisplay'

const ConnectionCheck = () => {
  const [isOnline, setIsOnline] = useState(true) // Initialize to true to avoid showing overlay initially

  const setOnline = () => setIsOnline(true)
  const setOffline = () => setIsOnline(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOffline)

    return () => {
      window.removeEventListener('online', setOnline)
      window.removeEventListener('offline', setOffline)
    }
  }, [])

  return (
    <>
      {!isOnline && (
        <Overlay>
            <Stack alignItems={'center'} spacing={2} justifyContent={'center'}>
            <StatusDisplay
                size={96}
                status={"WIFI-OFF"}
            />
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
