import { Paper, Stack, Box, Typography, Button } from '@mui/material'
import { getStudentEntryLink } from '@/code/utils'
const JoinClipboard = ({ evaluationId }) => (
  <Paper>
    
    <Stack
      direction="column"
      p={2}
      spacing={2}
    >
      <Stack direction="row" spacing={2} alignItems="center" width="100%">
        <Stack flex={1}>
          <Typography variant="caption" size="small">
            {getStudentEntryLink(evaluationId)}
          </Typography>
        </Stack>
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(
                getStudentEntryLink(evaluationId)
              )
            }}
          >
            Copy
          </Button>
        </Box>
      </Stack>
    </Stack>
  </Paper>
)
export default JoinClipboard
