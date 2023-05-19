import { Menu, Button, Stack } from '@mui/material'
import LockClosedIcon from '@mui/icons-material/Lock'
import GroupIcon from '@mui/icons-material/Group'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
const UserContextMenu = ({ anchorElUser, handleCloseUserMenu }) => {
  return (
    <Menu
      sx={{ mt: '40px' }}
      id="menu-appbar"
      anchorEl={anchorElUser}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(anchorElUser)}
      onClose={handleCloseUserMenu}
    >
      <Stack padding={2} spacing={2} alignItems={'flex-start'}>
        <Link href={`/groups`}>
          <Button startIcon={<GroupIcon />}>Manage Groups</Button>
        </Link>
        <Button onClick={() => signOut()} startIcon={<LockClosedIcon />}>
          Sign Out
        </Button>
      </Stack>
    </Menu>
  )
}

export default UserContextMenu
