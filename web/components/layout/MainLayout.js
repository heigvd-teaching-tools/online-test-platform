import { useState } from 'react';
import { AppBar, Box, Toolbar, Menu, Button, Stack } from '@mui/material';

import MainMenu from './MainMenu';

import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockClosedIcon from '@mui/icons-material/Lock';

import { useSession, signOut, signIn } from 'next-auth/react';
import UserAvatar from './UserAvatar';
import LoadingAnimation from './LoadingAnimation';
import Logo from './Logo';

import SnackbarFeedback from '../feedback/SnackbarFeedback';


const MainLayout = ({children}) => {
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
                <AppBar position="static" enableColorOnDark>
                    <Toolbar variant="dense">   
                        <Box sx={{ mr:2, pt:0 }}>
                            <Logo />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <MainMenu />
                        </Box>
                        
                        <UserAvatar user={session.user} onCLick={handleOpenUserMenu} />
                        <ContextMenu anchorElUser={anchorElUser} handleCloseUserMenu={handleCloseUserMenu} /> 
                    </Toolbar>
                </AppBar>
                <Stack sx={{ height: 'calc(100vh - 48px)', p:6 }} alignItems="center">
                    {children}
                </Stack>
            </Box> 
            }
            <SnackbarFeedback />
       </>
    );
}


const ContextMenu = ({anchorElUser, handleCloseUserMenu }) =>  
    <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{ vertical: 'top', horizontal: 'right', }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right', }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
    >
        <Button onClick={() => signOut()} startIcon={<LockClosedIcon />}>Sign Out</Button>
    </Menu>

              

export default MainLayout;