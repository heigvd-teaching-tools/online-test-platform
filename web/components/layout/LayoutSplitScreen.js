import { useState } from 'react';
import { AppBar, Box, Toolbar, Stack } from '@mui/material';
import { useSession } from 'next-auth/react';

import LoadingAnimation from '../feedback/LoadingAnimation';
import LoginGitHub from './LoginGitHub';
import Logo from './Logo';
import UserAvatar from './UserAvatar';
import UserContextMenu from './UserContextMenu';

import SnackbarFeedback from '../feedback/SnackbarFeedback';
import ResizePanel from './utils/ResizePanel';

const LayoutSplitScreen = ({header, subheader, leftPanel, rightPanel, rightWidth = 60}) => {
    const { data: session, status } = useSession();

    const [anchorElUser, setAnchorElUser] = useState(null);   
    const handleOpenUserMenu    = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu   = () => setAnchorElUser(null);

    return (
        <>            
            { status === 'loading' && <LoadingAnimation /> }
            { status === 'unauthenticated' && <LoginGitHub />}
            { status === 'authenticated' &&
            <Box>
                <AppBar position="static" enableColorOnDark color="transparent" sx={{ height: '48px', maxWidth: '100vw'  }}>  
                    <Stack direction="row">
                        <Box sx={{ mt:0.6, ml:1 }}>
                            <Logo color="red" />
                        </Box>
                        <Box sx={{ flex: 1, overflow:'hidden' }}>
                            {header}
                        </Box>
                        <UserAvatar user={session.user} onCLick={handleOpenUserMenu} />
                        <UserContextMenu anchorElUser={anchorElUser} handleCloseUserMenu={handleCloseUserMenu} /> 
                    </Stack>
                </AppBar>
                { subheader && (
                    <Box sx={{ flex: 1, overflow:'hidden' }}>{subheader}</Box>
                )}
                <Stack sx={{ height: `calc(100vh - 48px - ${subheader ? '66px' : '0px'})`, width:'100vw' }} alignItems="center">
                    <Stack sx={{ minWidth:'100%', minHeight: '100%' }}>
                        <ResizePanel 
                            rightWidth={rightWidth}
                            leftPanel={leftPanel}
                            rightPanel={rightPanel}
                        />
                    </Stack>
                </Stack>
            </Box> 
            }
            <SnackbarFeedback />
       </>
    );
}


export default LayoutSplitScreen;