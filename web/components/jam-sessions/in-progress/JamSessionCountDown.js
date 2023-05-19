import { useState, useEffect, useCallback } from 'react'
import { Typography, Chip, Box, Stack } from '@mui/material'
import DateCountdown from '../../ui/DateCountdown'
import PiePercent from '../../feedback/PiePercent'

const JamSessionCountDown = ({ startDate, endDate, onFinish }) => {
  const [percentage, setPercentage] = useState(100)

  const updatePercentage = useCallback(() => {
    // percentage of now between start and end
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    const newPercentage = (elapsed / duration) * 100
    setPercentage(newPercentage)
  }, [startDate, endDate])

  useEffect(() => {
    // first render init percentage
    updatePercentage()
  }, [updatePercentage])

  return (
    <Chip
      avatar={
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ bgcolor: 'white', borderRadius: '50%' }}
        >
          <PiePercent
            value={percentage}
            size={24}
            thickness={22}
            label=" "
            colors={{
              0: '#2e7d32',
              40: '#0288d1',
              70: '#d32f2f',
            }}
          />
        </Stack>
      }
      label={
        <Typography variant="button">
          <DateCountdown
            untilDate={endDate}
            onTic={updatePercentage}
            onFinish={onFinish}
          />
        </Typography>
      }
    />
  )
}

export default JamSessionCountDown
