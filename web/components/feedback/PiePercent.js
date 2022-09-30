import { Box, CircularProgress, Typography } from '@mui/material';

const PiePercent = ({ value, size = 45, label }) => {
    const color = value > 70 ? 'success' : value > 40 ? 'info' : 'error';
    return (
        <Box sx={{ position:'relative', display:'inline-flex' }}>
            <CircularProgress
                size={size}
                variant="determinate"
                value={value}
                sx={{ color: (theme) => theme.palette[color].main }}
            />
            <Typography variant="caption" sx={{ position:'absolute', top:0, left:0, right:0, bottom:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {label ? label : `${value}%`}
            </Typography>
        </Box>
    )
}
export default PiePercent;