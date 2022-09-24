import { Box, Stack } from '@mui/material';

import MainMenu from './MainMenu';

import SnackbarFeedback from '../feedback/SnackbarFeedback';
import Header from './Header';

const LayoutMain = ({children}) => {
    return (
        <> 
            <Box>
                <Header color="transparent">
                    <MainMenu />
                </Header>
                <Stack sx={{ height: 'calc(100vh - 48px)', p:6 }} alignItems="center">
                    {children}
                </Stack>
            </Box> 
            
            <SnackbarFeedback />
       </>
    );
}



              

export default LayoutMain;