import { Paper, Stack, Box, Typography, Button } from "@mui/material";
const JoinClipboard = ({ sessionId }) =>
    <Paper>
        <Stack direction="row" p={2} spacing={2} justifyContent="space-between" alignItems="center">
            <Box><Typography variant="caption" size="small">{`${window && window.location.origin}/exam-sessions/${sessionId}`}</Typography></Box>
            <Box><Button variant="outlined" color="secondary" onClick={async () => {
                await navigator.clipboard.writeText(`${window && window.location.origin}/exam-sessions/${sessionId}`);
            }}>Copy</Button></Box>
        </Stack>
    </Paper>
export default JoinClipboard;
