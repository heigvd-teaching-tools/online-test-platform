import { Paper, Stack, Box, Typography, Button } from '@mui/material'
import { getStudentEntryLink } from '../../code/utils'
const JoinClipboard = ({ jamSessionId }) => (
  <Paper>
    <Stack
      direction="row"
      p={2}
      spacing={2}
      justifyContent="space-between"
      alignItems="center"
    >
      <Box>
        <Typography variant="caption" size="small">
          {getStudentEntryLink(jamSessionId)}
        </Typography>
      </Box>
      <Box>
        <Button
          variant="outlined"
          color="secondary"
          onClick={async () => {
            await navigator.clipboard.writeText(
              getStudentEntryLink(jamSessionId)
            )
          }}
        >
          Copy
        </Button>
      </Box>
    </Stack>
  </Paper>
)
export default JoinClipboard
