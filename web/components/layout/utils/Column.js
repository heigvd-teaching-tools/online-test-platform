import { Box } from '@mui/material';

const Column = ({ children, width, flexGrow, flex, alignItems, right }) => {
    let sx = {};

    if (flexGrow) {
        sx.flex = flexGrow;
    }

    if (flex) {
        sx.flex = flex;
    }

    if(alignItems){
        sx.alignItems = alignItems;
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