import { Snackbar, Paper, Box, Stack, Typography } from '@mui/material';
import { useSnackbar } from '../../context/SnackbarContext';
import { useTheme } from '@mui/material';

const SnackbarFeedback = () => {
    const theme = useTheme();
    const { snackbar: { open, message, severity = "success"}, hide } = useSnackbar();
    return (
        <Snackbar sx={{ mt:5 }} anchorOrigin={{ vertical: 'top', horizontal:'right' }} open={open} autoHideDuration={3000} onClose={hide}>
            <Paper elevation={4}>
                <Stack direction="row" sx={{ p:0 }}>
                    <Box sx={{ minWidth: 8, maxWidth: 8, backgroundColor: theme.palette[severity].main }}></Box>
                    <Box sx={{ pl:2, pr:2, pt:1, pb:1 }}>
                        <Typography variant="caption">{message}</Typography>
                    </Box>
                </Stack>               
            </Paper>
        </Snackbar>
    )
}

export default SnackbarFeedback;