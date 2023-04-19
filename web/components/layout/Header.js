import { useState } from 'react';

import {AppBar, Box, MenuItem, Select, Stack} from '@mui/material';
import { useSession } from 'next-auth/react';

import UserAvatar from './UserAvatar';
import UserContextMenu from './UserContextMenu';
import Logo from './Logo';
import DropDown from "../input/DropDown";

const Header = ({children, color}) => {
    const { data: session } = useSession();
    const [anchorElUser, setAnchorElUser] = useState(null);
    const handleOpenUserMenu    = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu   = () => setAnchorElUser(null);
    console.log("Session", session.user.groups)
    return (
        <AppBar position="static" enableColorOnDark color={color} sx={{ height: '48px', maxWidth: '100vw', p:0, position:'relative', zIndex:1000  }}>
            <Stack direction="row" alignItems="center" pl={1} pr={1} spacing={1}>
                <Box sx={{ mr:1, mt:0.5 }}>
                    <Logo color="red" />
                </Box>
                <Stack flex={1} sx={{ overflow:'hidden' }}>
                    {children}
                </Stack>


                <UserAvatar user={session.user} onCLick={handleOpenUserMenu} />
                <UserContextMenu anchorElUser={anchorElUser} handleCloseUserMenu={handleCloseUserMenu} />
            </Stack>
        </AppBar>
    );
}

export default Header;
