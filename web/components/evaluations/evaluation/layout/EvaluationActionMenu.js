import { useSnackbar } from "@/context/SnackbarContext"
import { Stack } from "@mui/system"
import { Button } from "@mui/material"
import { getNextPhase, getPhaseDetails } from "../phases"
import SkipNextIcon from '@mui/icons-material/SkipNext';
import StatusDisplay from "@/components/feedback/StatusDisplay";

const EvaluationActionMenu = ({ groupScope, evaluation, onPhaseChange }) => {
  
    const { show: showSnackbar } = useSnackbar()
    // display the next phase button
    const nextPhase = getNextPhase(evaluation.phase)
    const phaseDetails = getPhaseDetails(evaluation.phase)
  
    const onButtonClick = async () => {
      // post to the evaluation endpoint to change the phase
       await fetch(`/api/${groupScope}/evaluations/${evaluation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ phase: nextPhase }),
      }).then((response) => {
        console.log("response", response)
        if (response.ok) {
          onPhaseChange()
          showSnackbar('Phase changed', 'success')
        }
      })
    }
  
    return (
      <Stack direction="row" spacing={2} justifyContent="center">
        {phaseDetails && phaseDetails.nextPhaseButton ? (
          <Button 
            variant="text" 
            color="info" 
            onClick={onButtonClick}
            endIcon={<SkipNextIcon />}
            startIcon={<phaseDetails.nextPhaseButton.icon />}
          >
            {phaseDetails.nextPhaseButton.label}
          </Button>
        ) : <StatusDisplay status={"SUCCESS"} size={48} />}
      </Stack>
    )
}

export default EvaluationActionMenu