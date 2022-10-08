import { Box, Stack } from '@mui/material';

import MainMenu from './MainMenu';

import SnackbarFeedback from '../feedback/SnackbarFeedback';
import Header from './Header';

const LayoutMain = ({children, subheader}) => {
    return (
        <> 
            <Box>
                <Header color="transparent">
                    <MainMenu />
                </Header>
                { subheader && (
                    <Box sx={{ flex: 1, overflow:'hidden' }}>{subheader}</Box>
                )}
                <Stack sx={{ height: 'calc(100vh - 48px)', p:6 }} alignItems="center">
                    {children}
                </Stack>
            </Box> 
            
            <SnackbarFeedback />
       </>
    );
}



              

export default LayoutMain;