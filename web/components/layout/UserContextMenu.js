import { Menu, Button } from '@mui/material';
import LockClosedIcon from '@mui/icons-material/Lock';
import { signOut } from 'next-auth/react';

const UserContextMenu = ({anchorElUser, handleCloseUserMenu }) =>  
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

export default UserContextMenu;