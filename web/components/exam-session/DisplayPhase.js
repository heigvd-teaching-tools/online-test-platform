import { Chip } from '@mui/material';
import { ExamSessionPhase } from '@prisma/client';

const DisplayPhase = ({phase}) => {
    switch (phase) {
      case ExamSessionPhase.DRAFT:
        return <Chip label="Draft" color="warning" />;
      case ExamSessionPhase.IN_PROGRESS:
        return <Chip label="In progress" color="info" />;
      case ExamSessionPhase.GRADING:
        return <Chip label="Grading" color="primary" />;
      case ExamSessionPhase.FINISHED:
        return <Chip label="Finished" color="success" />;
      default:
        return <Chip label="N/A" color="error" />;
    }
 }

export default DisplayPhase;