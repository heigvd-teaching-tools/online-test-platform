import { Paper, Stack, Box, Typography, Button } from "@mui/material";
const RegistrationClipboard = ({ sessionId }) => {
    return (
        <Paper>
            <Stack direction="row" p={2} spacing={2} justifyContent="space-between" alignItems="center">
                <Box><Typography variant="caption" size="small">{`http://localhost:3000/exam-sessions/${sessionId}/register`}</Typography></Box>
                <Box><Button variant="outlined" color="secondary" onClick={() => {
                    navigator.clipboard.writeText(`http://localhost:3000/exam-sessions/${sessionId}/register`);
                }}>Copy</Button></Box>
            </Stack>
        </Paper>
    )
}

export default RegistrationClipboard;