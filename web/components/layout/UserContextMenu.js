import { Menu, Button, MenuItem, Stack } from '@mui/material';
import LockClosedIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import {signOut, useSession} from 'next-auth/react';
const UserContextMenu = ({ anchorElUser, handleCloseUserMenu }) => {
const { data: session } = useSession();
return(
    <Menu
        sx={{ mt: '40px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{ vertical: 'top', horizontal: 'right', }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right', }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
    >
        <Stack padding={2} spacing={2} alignItems={"flex-start"}>
            <Button onClick={() => signOut()} startIcon={<GroupIcon />}>Manage Groups</Button>
            <Button onClick={() => signOut()} startIcon={<LockClosedIcon />}>Sign Out</Button>
        </Stack>
    </Menu>
)
}

export default UserContextMenu;
