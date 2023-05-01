import { Paper, Stack, Box, Typography, Button } from "@mui/material";
const JoinClipboard = ({ jamSessionId }) =>
    <Paper>
        <Stack direction="row" p={2} spacing={2} justifyContent="space-between" alignItems="center">
            <Box><Typography variant="caption" size="small">{`${window && window.location.origin}/jam-sessions/${jamSessionId}`}</Typography></Box>
            <Box><Button variant="outlined" color="secondary" onClick={async () => {
                await navigator.clipboard.writeText(`${window && window.location.origin}/jam-sessions/${jamSessionId}`);
            }}>Copy</Button></Box>
        </Stack>
    </Paper>
export default JoinClipboard;
