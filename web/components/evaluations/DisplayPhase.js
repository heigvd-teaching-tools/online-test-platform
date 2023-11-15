import { Chip } from '@mui/material'
import { EvaluationPhase } from '@prisma/client'
const DisplayPhase = ({ phase }) => {
  switch (phase) {
    case EvaluationPhase.DRAFT:
      return <Chip label="Draft" color="warning" />
    case EvaluationPhase.IN_PROGRESS:
      return <Chip label="In progress" color="info" />
    case EvaluationPhase.GRADING:
      return <Chip label="Grading" color="primary" />
    case EvaluationPhase.FINISHED:
      return <Chip label="Finished" color="success" />
    default:
      return <Chip label="N/A" color="error" />
  }
}

export default DisplayPhase
