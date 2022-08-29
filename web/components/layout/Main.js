import Link from 'next/link';
import { useState } from 'react';
import { AppBar, Box, Toolbar, IconButton, Avatar, Menu, Button, Typography, Stack, Snackbar } from '@mui/material';
import { Tabs, Tab } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockClosedIcon from '@mui/icons-material/Lock';

import { useSession, signOut, signIn } from 'next-auth/react';
import LoadingAnimation from './LoadingAnimation';
import Logo from './Logo';

import SnackbarFeedback from '../feedback/SnackbarFeedback';

const Main = ({children}) => {
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
                        <Box sx={{ mr:2, pt:1 }}>
                            <Logo />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <MainMenu />
                        </Box>
                        
                        <Stack direction="row" onClick={handleOpenUserMenu} >   
                            <IconButton sx={{ p: 0 }}>
                                <Avatar alt={session.user.name} src={session.user.image} sx={{ width: 32, height: 32 }} />
                            </IconButton>
                            <Box sx={{ ml:1, cursor:'pointer' }}>
                                <Typography variant="body2" color="inherit">
                                    {session.user.name}
                                </Typography>
                                <Typography variant="caption" color="inherit">
                                    {session.user.email}
                                </Typography>
                            </Box>                           
                        </Stack>
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

const MainMenu = () => {
    return (
        <Tabs value="exams" aria-label="main-menu" textColor="inherit" indicatorColor="secondary">
            <Link value="exams" href="/exams" passHref>
                <Tab label="Exams" sx={{ opacity:1 }} />
            </Link>
            <Link value="exam-sessions" href="/exam-session" passHref>
                <Tab label="Exam Sessions" sx={{ opacity:1 }}  />
            </Link>
        </Tabs>
    )
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

              

export default Main;