import { Box, Stack } from '@mui/material';

import Header from './Header';
const LayoutMain = ({children, header, subheader, padding = 0, spacing = 0}) => {
    return (
        <>
            <Stack sx={{ height: '100vh', width: '100vw' }}>
                <Header color="transparent"> {header} </Header>
                { subheader && (<Box sx={{ overflow:'hidden' }}>{subheader}</Box>) }
                <Stack sx={{ flex:1, overflow:'auto' }} alignItems="center">
                    <Stack spacing={spacing} sx={{ height:'100%', width:'100%', p:padding }}>{children}</Stack>
                </Stack>
            </Stack>

       </>
    );
}

export default LayoutMain;
