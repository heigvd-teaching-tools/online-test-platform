import { useState, useEffect } from 'react'
import {
  Stack,
  Typography,
  List,
  FormGroup,
  FormControlLabel,
  Switch,
} from '@mui/material'
import DurationPicker from '../../input/DurationPicker'
import UserAvatar from '../../layout/UserAvatar'
import StudentRegistration from './StudentRegistration'

const StepSchedule = ({ jamSession, onChange }) => {
  const [useDuration, setUseDuration] = useState(false)
  const [duration, setDuration] = useState({
    hours: 0,
    minutes: 15,
  })

  useEffect(() => {
    onChange(useDuration ? duration : { hours: 0, minutes: 0 })
  }, [duration, useDuration, onChange])

  useEffect(() => {
    if (jamSession) {
      if (jamSession.durationHours > 0 || jamSession.durationMins > 0) {
        // hours and minutes between startAt and endAt
        setUseDuration(true)
        setDuration({
          hours: jamSession.durationHours,
          minutes: jamSession.durationMins,
        })
      }
    }
  }, [jamSession])

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Schedule</Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={useDuration}
              onChange={(e) => {
                setUseDuration(e.target.checked)
                if (!e.target.checked) {
                  setDuration(undefined)
                }
              }}
            />
          }
          label="Set jam session duration"
        />
      </FormGroup>
      {useDuration && (
        <DurationPicker
          value={duration}
          onChange={(value) => {
            if (
              duration &&
              (value.hours !== duration.hours ||
                value.minutes !== duration.minutes)
            ) {
              setDuration(value)
            }
          }}
        />
      )}
      <StudentRegistration 
        students={jamSession?.students}
      />
    </Stack>
  )
}


export default StepSchedule
