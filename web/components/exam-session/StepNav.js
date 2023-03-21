import { Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import DisplayPhase from './DisplayPhase';
const StepNav = ({ activeStep, totalSteps, phase, saveRunning, onBack, onNext, onFinalStep }) => {
    return (
        <Stack direction="row" justifyContent="space-between">
            <LoadingButton onClick={onBack} loading={saveRunning || false} disabled={activeStep === 0}>Back</LoadingButton>

            <DisplayPhase phase={phase} />

            {
                activeStep < totalSteps - 1 &&
                <LoadingButton onClick={onNext} loading={saveRunning || false}>
                    Next
                </LoadingButton>
            }

            {
                activeStep === totalSteps - 1 &&
                <LoadingButton onClick={onFinalStep} loading={saveRunning || false}>
                    Finish
                </LoadingButton>
            }

        </Stack>
    )
}

export default StepNav
