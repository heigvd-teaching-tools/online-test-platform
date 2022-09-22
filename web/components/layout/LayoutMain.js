import { useState } from 'react';
import { AppBar, Box, Toolbar, Button, Stack } from '@mui/material';

import MainMenu from './MainMenu';

import LockOpenIcon from '@mui/icons-material/LockOpen';

import { useSession, signIn } from 'next-auth/react';
import UserAvatar from './UserAvatar';
import UserContextMenu from './UserContextMenu';
import LoadingAnimation from '../feedback/LoadingAnimation';
import Logo from './Logo';

import SnackbarFeedback from '../feedback/SnackbarFeedback';
import Header from './Header';

const LayoutMain = ({children}) => {
    const { status } = useSession();

    return (
        <>            
            { status === 'loading' && <LoadingAnimation /> }
            
            { status === 'unauthenticated' && 
                <Box sx={{ display:'flex', width:'100vw', height: '100vh', alignItems:"center", justifyContent: "center" }} >
                    <Button variant="contained" onClick={() => signIn("github")} startIcon={<LockOpenIcon />}>Sign In</Button> 
                </Box>
            }
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