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
import { useEffect, useState } from 'react'
import { Stack, TextField, Typography } from '@mui/material'
import ContentEditor from '@/components/input/ContentEditor'

const StepGeneralInformation = ({ evaluation, onChange }) => {
  const [label, setLabel] = useState(
    evaluation && evaluation.label ? evaluation.label : ''
  )
  const [errorLabel, setErrorLabel] = useState(false)
  const [conditions, setConditions] = useState(
    evaluation ? evaluation.conditions : ''
  )

  useEffect(() => {
    if (!label && evaluation) {
      setLabel(evaluation.label)
      setErrorLabel({ error: false })
      setConditions(evaluation.conditions)
    }
  }, [evaluation, setLabel, setErrorLabel, setConditions])

  useEffect(() => {
    onChange({
      label,
      conditions,
    })
  }, [label, conditions, setErrorLabel, onChange])

  useEffect(() => {
    let error = !label || label.length === 0
    setErrorLabel(error)
    if (error) {
      setLabel('')
    }
  }, [label, setErrorLabel, setLabel])

  return (
    <Stack spacing={2} pt={2}>
      <Typography variant="h6">General Informations</Typography>
      <TextField
        label="Label"
        id="evaluation-label"
        fullWidth
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        error={errorLabel}
        helperText={errorLabel ? 'Label is required' : ''}
      />
      <ContentEditor
        id={`conditions`}
        title="Conditions"
        mode="split"
        fill={false}
        rawContent={conditions}
        readOnly={false}
        onChange={(content) => setConditions(content)}
      />
    </Stack>
  )
}

export default StepGeneralInformation
