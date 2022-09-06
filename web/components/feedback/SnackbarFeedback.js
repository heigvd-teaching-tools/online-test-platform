import { Snackbar, Alert, Paper } from '@mui/material';
import { useSnackbar } from '../../context/SnackbarContext';

const SnackbarFeedback = () => {
    const { snackbar: { open, message, severity = "success"}, hide } = useSnackbar();
    return (
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal:'center' }} open={open} autoHideDuration={3000} onClose={hide}>
            <Paper elevation={4}>
                <Alert variant="filled" onClose={hide} severity={severity} sx={{ width: '100%' }}>{message}</Alert>
            </Paper>
        </Snackbar>
    )
}

export default SnackbarFeedback;