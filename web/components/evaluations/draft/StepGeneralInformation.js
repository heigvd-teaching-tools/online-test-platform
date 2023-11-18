import { useEffect, useState } from 'react'
import { Stack, TextField, Typography } from '@mui/material'

const StepGeneralInformation = ({ evaluation, onChange }) => {
  const [label, setLabel] = useState(
    evaluation && evaluation.label ? evaluation.label : ''
  )
  const [errorLabel, setErrorLabel] = useState(false)
  const [conditions, setConditions] = useState(
    evaluation && evaluation.conditions ? evaluation.conditions : ''
  )

  useEffect(() => {
    if (!label && evaluation) {
      setLabel(evaluation.label)
      setErrorLabel({ error: false })
      setConditions(evaluation.conditions)
    }
  }, [evaluation, setLabel, setErrorLabel, setConditions, label, conditions])

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

      <TextField
        label="Conditions"
        id="evaluation-conditions"
        fullWidth
        multiline
        rows={4}
        value={conditions || ''}
        onChange={(e) => setConditions(e.target.value)}
      />
    </Stack>
  )
}

export default StepGeneralInformation
