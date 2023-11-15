import { StepLabel, StepContent, Typography, Stack, Box, Alert } from '@mui/material'
import MinutesSelector from '../in-progress/MinutesSelector'
import EvaluationCountDown from './EvaluationCountDown'
const StepInProgress = ({ evaluation, onDurationChange, onEvaluationEnd }) => {
  return (
    <>
      <StepLabel>In progress</StepLabel>
      <StepContent>
        {evaluation.startAt && evaluation.endAt ? (
          <DurationManager
            evaluation={evaluation}
            onChange={onDurationChange}
            onEvaluationEnd={onEvaluationEnd}
          />
        ) : (
          <Stack
            spacing={4}
            direction="row"
            alignItems="center"
            justifyContent="center"
          >
            <Box>
              <Typography variant="h6">
                The exam session is in progress.
              </Typography>
              <Typography variant="body1">
                To end the evaluation click the button below.
              </Typography>
            </Box>
          </Stack>
        )}
      </StepContent>
    </>
  )
}

const DurationManager = ({ evaluation, onChange, onEvaluationEnd }) => {
  return (
    <Stack pt={4} pb={4} spacing={2}>
      <Stack
        spacing={4}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <MinutesSelector
          label={'Reduce by'}
          color="primary"
          onClick={async (minutes) => {
            // remove minutes to endAt
            let newEndAt = new Date(evaluation.endAt)
            newEndAt.setMinutes(newEndAt.getMinutes() - minutes)
            newEndAt = new Date(newEndAt).toISOString()
            onChange(newEndAt)
          }}
        />
        <Typography variant="body1">
          {`Started at ${new Date(evaluation.startAt).toLocaleTimeString()}`}
        </Typography>
        <EvaluationCountDown
          startDate={evaluation.startAt}
          endDate={evaluation.endAt}
          onFinish={onEvaluationEnd}
        />
        <Typography variant="body1">
          {`Ends at ${new Date(evaluation.endAt).toLocaleTimeString()}`}
        </Typography>
        <MinutesSelector
          label={'Extend for'}
          color="info"
          onClick={async (minutes) => {
            // add minutes to endAt
            let newEndAt = new Date(evaluation.endAt)
            newEndAt.setMinutes(newEndAt.getMinutes() + minutes)
            newEndAt = new Date(newEndAt).toISOString()
            onChange(newEndAt)
          }}
        />
      </Stack>
      <Alert severity={'info'}>
        <Typography variant="body1">
          The evaluation will <b>not end automatically</b> after the contdown.
        </Typography>
      </Alert>
    </Stack>
  )
}

export default StepInProgress
