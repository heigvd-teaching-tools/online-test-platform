import { Box, Stack } from '@mui/material';

import MainMenu from './MainMenu';

import { useSession, signIn } from 'next-auth/react';

import LoginGitHub from './LoginGitHub';
import LoadingAnimation from '../feedback/LoadingAnimation';

import SnackbarFeedback from '../feedback/SnackbarFeedback';
import Header from './Header';

const LayoutMain = ({children}) => {
    const { status } = useSession();

    return (
        <>            
            { status === 'loading' && <LoadingAnimation /> }
            { status === 'unauthenticated' && <LoginGitHub /> }
            { status === 'authenticated' &&
                <Box>
                    <Header color="transparent">
                        <MainMenu />
                    </Header>
                    <Stack sx={{ height: 'calc(100vh - 48px)', p:6 }} alignItems="center">
                        {children}
                    </Stack>
                </Box> 
            }
            <SnackbarFeedback />
       </>
    );
}



              

export default LayoutMain;