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

import { useState, useEffect } from 'react'
import {
  Stack,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Alert,
  AlertTitle,
} from '@mui/material'
import DurationPicker from '@/components/input/DurationPicker'

const StepSchedule = ({ evaluation, onChange }) => {
  const [useDuration, setUseDuration] = useState(false)
  const [duration, setDuration] = useState({
    hours: 0,
    minutes: 0,
  })

  useEffect(() => {
    onChange(useDuration ? duration : { hours: 0, minutes: 0 })
  }, [duration, useDuration, onChange])

  useEffect(() => {
    if (evaluation) {
      if (evaluation.durationHours > 0 || evaluation.durationMins > 0) {
        // hours and minutes between startAt and endAt
        setUseDuration(true)
        setDuration({
          hours: evaluation.durationHours,
          minutes: evaluation.durationMins,
        })
      }
    }
  }, [evaluation])

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
                  setDuration({
                    hours: 0,
                    minutes: 0,
                  })
                }
              }}
            />
          }
          label="Set evaluation duration"
        />
      </FormGroup>
      {useDuration && (
        <>
          <Alert severity="warning">
            <AlertTitle>Warning</AlertTitle>
            <Typography variant="body1">
              The evaluation will not end automatically. You will have to end it
              manually in the in-progress phase.
            </Typography>
            <Typography variant="body1">
              The sole purpose of this feature is to give students an idea of
              the time they have to complete the evaluation.
            </Typography>
          </Alert>
          <DurationPicker
            value={duration}
            onChange={(value) => {
              setDuration(value)
            }}
          />
        </>
      )}
    </Stack>
  )
}

export default StepSchedule
