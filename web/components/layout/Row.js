import { Stack } from '@mui/material';

const Row = ({ children, align = "center" }) => {
    return (
        <Stack direction="row" spacing={1} p={1} width="100%" alignItems={align}>{ children }</Stack>
    )
} ;

export default Row;