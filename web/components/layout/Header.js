import { useState } from 'react';

import { AppBar, Box, Toolbar } from '@mui/material';
import { useSession } from 'next-auth/react';

import UserAvatar from './UserAvatar';
import UserContextMenu from './UserContextMenu';
import Logo from './Logo';
import { Stack } from '@mui/system';

const Header = ({children, color}) => {
    const { data: session } = useSession();
    const [anchorElUser, setAnchorElUser] = useState(null);   
    const handleOpenUserMenu    = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu   = () => setAnchorElUser(null);

    return (
        <AppBar position="static" enableColorOnDark color={color} sx={{ height: '48px', maxWidth: '100vw', p:0  }}>
            <Stack direction="row" alignItems="center" sx={{ pl:1, pr:1 }}>
                <Box sx={{ mr:1, pt:0 }}>
                    <Logo color="red" />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    {children}
                </Box>
                <UserAvatar user={session.user} onCLick={handleOpenUserMenu} />
                <UserContextMenu anchorElUser={anchorElUser} handleCloseUserMenu={handleCloseUserMenu} /> 
            </Stack>
        </AppBar>
    );
}

export default Header;