import { Stack } from '@mui/material';

const Row = ({ children, align = "center", spacing = 1, padding = 1 }) => {
    return (
        <Stack direction="row" spacing={spacing} p={padding} width="100%" alignItems={align}>{ children }</Stack>
    )
} ;

export default Row;