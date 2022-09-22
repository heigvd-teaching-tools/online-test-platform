import { useState } from 'react';
import { AppBar, Box, Toolbar, Button, Stack } from '@mui/material';
import { useSession, signIn } from 'next-auth/react';

import LockOpenIcon from '@mui/icons-material/LockOpen';
import LoadingAnimation from '../feedback/LoadingAnimation';
import Logo from './Logo';
import UserAvatar from './UserAvatar';
import UserContextMenu from './UserContextMenu';

import SnackbarFeedback from '../feedback/SnackbarFeedback';
import ResizePanel from './utils/ResizePanel';

const LayoutSplitScreen = ({header, subheader, leftPanel, rightPanel}) => {
    const { data: session, status } = useSession();

    const [anchorElUser, setAnchorElUser] = useState(null);   
    const handleOpenUserMenu    = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu   = () => setAnchorElUser(null);

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
                <AppBar position="static" enableColorOnDark color="transparent" sx={{ height: '48px', maxWidth: '100vw'  }}>
                    <Toolbar variant="dense">   
                        <Box sx={{ mr:0, pt:0 }}>
                            <Logo color="red" />
                        </Box>
                        <Box sx={{ flex: 1, overflow:'hidden' }}>
                            {header}
                        </Box>
                        <UserAvatar user={session.user} onCLick={handleOpenUserMenu} />
                        <UserContextMenu anchorElUser={anchorElUser} handleCloseUserMenu={handleCloseUserMenu} /> 
                    </Toolbar>
                </AppBar>
                { subheader && (
                    <Stack sx={{ p:1 }}>{subheader}</Stack>
                )}
                <Stack sx={{ height: `calc(100vh - 48px - ${subheader ? '66px' : '0px'})`, width:'100vw' }} alignItems="center">
                    <Stack sx={{ minWidth:'100%', minHeight: '100%' }}>
                        <ResizePanel 
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