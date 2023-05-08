import { Box, Stack } from '@mui/material';

import Header from './Header';
const LayoutMain = ({children, header, subheader, padding = 0, spacing = 0}) => {
    return (
        <>
            <Stack height={"100vh"} width={"100vw"}>
                <Header color="transparent"> {header} </Header>
                { subheader && (<Box sx={{ overflow:'hidden' }}>{subheader}</Box>) }
                <Stack flex={1} maxHeight={"100%"} overflow={"auto"} alignItems="center">
                    <Stack height={"100%"} width={"100%"} spacing={spacing} p={padding}>{children}</Stack>
                </Stack>
            </Stack>

       </>
    );
}

export default LayoutMain;
