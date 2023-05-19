import { Chip } from '@mui/material'
import { JamSessionPhase } from '@prisma/client'
const DisplayPhase = ({ phase }) => {
  switch (phase) {
    case JamSessionPhase.DRAFT:
      return <Chip label="Draft" color="warning" />
    case JamSessionPhase.IN_PROGRESS:
      return <Chip label="In progress" color="info" />
    case JamSessionPhase.GRADING:
      return <Chip label="Grading" color="primary" />
    case JamSessionPhase.FINISHED:
      return <Chip label="Finished" color="success" />
    default:
      return <Chip label="N/A" color="error" />
  }
}

export default DisplayPhase
