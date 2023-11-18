import { Typography, Stack, Alert, AlertTitle } from '@mui/material'
import MinutesSelector from '../in-progress/MinutesSelector'
import EvaluationCountDown from './EvaluationCountDown'
const StepInProgress = ({ evaluation, onDurationChange, onEvaluationEnd }) => {
  return (
    <>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          <Stack alignContent={'center'} spacing={1} textAlign={'center'}>
            <Typography variant="h6">
              The evaluation is in progress.
            </Typography>
            <Typography variant="body1">
              To end the evaluation click the button below.
            </Typography>
          </Stack>
        </Stack>
        { evaluation.startAt && evaluation.endAt && (
          <DurationManager
            evaluation={evaluation}
            onChange={onDurationChange}
            onEvaluationEnd={onEvaluationEnd}
          />
        )}
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
        <Stack direction={'row'} alignItems={'center'} spacing={2}>
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
        </Stack>
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
          The evaluation will <b>not end automatically</b> after the countdown.
        </Typography>
      </Alert>
    </Stack>
  )
}

export default StepInProgress
