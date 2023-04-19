import {Menu, Button, MenuItem, Box, Stack, Typography} from '@mui/material';
import LockClosedIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import {signOut, useSession} from 'next-auth/react';
import DropDown from "../input/DropDown";
const UserContextMenu = ({anchorElUser, handleCloseUserMenu }) => {
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
        <Stack
            padding={2}
            spacing={2}
            alignItems={"flex-start"}
        >
            <DropDown
                name="group"
                defaultValue={session.user.selected_group.label}
                minWidth={'200px'}
                icon={<GroupIcon />}
                variant={"standard"}
            >
                {session.user.groups.map(({group}) => (
                    <MenuItem key={group.id} value={group.label}>{group.label}</MenuItem>
                ))}
            </DropDown>
            <Button onClick={() => signOut()} startIcon={<GroupIcon />}>Manage Groups</Button>
            <Button onClick={() => signOut()} startIcon={<LockClosedIcon />}>Sign Out</Button>
        </Stack>

    </Menu>
)
}

export default UserContextMenu;
