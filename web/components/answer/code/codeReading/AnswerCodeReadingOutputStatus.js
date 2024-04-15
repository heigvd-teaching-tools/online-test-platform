
import StatusDisplay from "@/components/feedback/StatusDisplay";
import { Stack } from "@mui/material";


const AnswerCodeReadingOutputStatus = ({ studentOutputTest = false, status }) => {
    return (
      <Stack direction={"row"} spacing={1}>
        {!studentOutputTest && (
          <StatusDisplay status={"CLI"} />
        )}
        {studentOutputTest && (
          <StatusDisplay status={status} />
        )}
      </Stack>
    );
}

export default AnswerCodeReadingOutputStatus;