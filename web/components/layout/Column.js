import { Box } from '@mui/material';

const Column = ({ children, width, flexGrow, right }) => {
    let sx = {};

    if (flexGrow) {
        sx.flex = flexGrow;
    }

    if(right){
        sx.alignItems = 'flex-end';
        sx.textAlign = 'right';
    }

    sx.width = width;

    return (
        <Box sx={{...sx, minWidth: 0}}>
        { children }
        </Box>
    )
}

export default Column;