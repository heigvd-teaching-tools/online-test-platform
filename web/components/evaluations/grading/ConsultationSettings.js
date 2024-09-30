import { useEffect, useState } from 'react'
import ToggleWithLabel from '@/components/input/ToggleWithLabel'
import { Alert, AlertTitle, Typography } from '@mui/material'
import { Stack } from '@mui/system'

const ConsultationSettings = ({ evaluation, onChange }) => {
  const [showSolutionsWhenFinished, setShowSolutionsWhenFinished] = useState(
    evaluation.showSolutionsWhenFinished,
  )
  const [consultationEnabled, setConsultationEnabled] = useState(
    evaluation.consultationEnabled,
  )

  useEffect(() => {
    setShowSolutionsWhenFinished(evaluation.showSolutionsWhenFinished)
    setConsultationEnabled(evaluation.consultationEnabled)
  }, [evaluation.showSolutionsWhenFinished, evaluation.consultationEnabled])

  const handleConsultationChange = (checked) => {
    setConsultationEnabled(checked)

    // If consultation is disabled, uncheck and disable solution viewing
    if (!checked) {
      setShowSolutionsWhenFinished(false)
      onChange(checked, false) // Pass both consultationEnabled and showSolutionsWhenFinished
    } else {
      onChange(checked, showSolutionsWhenFinished) // Only pass the updated consultationEnabled
    }
  }

  const handleSolutionsChange = (checked) => {
    setShowSolutionsWhenFinished(checked)
    onChange(consultationEnabled, checked) // Pass both consultationEnabled and updated showSolutionsWhenFinished
  }

  return (
    <>
      <Typography variant="h5">Consultation settings</Typography>
      <Stack spacing={2} direction="row">
        <ToggleWithLabel
          label="Enable consultation after grading"
          checked={consultationEnabled}
          onChange={(e) => handleConsultationChange(e.target.checked)}
        />
        <ToggleWithLabel
          label="Allow student to view official solutions"
          checked={showSolutionsWhenFinished}
          disabled={!consultationEnabled} // Disable if consultation is off
          onChange={(e) => handleSolutionsChange(e.target.checked)}
        />
      </Stack>

      <Alert severity="info">
        <AlertTitle>Enable consultation after grading</AlertTitle>
        <Typography variant="body2">
          Controls whether students can view their feedback, grades, or other consultation data after the grading phase.
        </Typography>
        <Typography variant="body2">
          - For <b>Exams</b>, consultation is disabled by default to ensure that students cannot access feedback or grades after the exam is over, maintaining confidentiality.
        </Typography>
        <Typography variant="body2">
          - For <b>TE (tests)</b> and <b>Training</b>, consultation is typically enabled to offer valuable feedback for continuous improvement and learning.
        </Typography>
        <Typography variant="body2">
          Note: Disabling consultation will also disable the ability to show solutions.
        </Typography>
      </Alert>

      <Alert severity="info">
        <AlertTitle>Allow student to view official solutions</AlertTitle>
        <Typography variant="body2">
          Controls whether students can see the official solutions to the evaluation once it is completed.
        </Typography>
        <Typography variant="body2">
          - For <b>Exams</b> and <b>TE (tests)</b>, this setting should generally be disabled to maintain confidentiality.
        </Typography>
        <Typography variant="body2">
          - For <b>Training</b>, enabling this setting helps students compare their answers with the correct ones, fostering learning.
        </Typography>
      </Alert>
    </>
  )
}

export default ConsultationSettings
