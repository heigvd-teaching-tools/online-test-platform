import LockPersonIcon from '@mui/icons-material/LockPerson'
import { signIn } from 'next-auth/react'
import { Box, Button } from '@mui/material'
const LoginGitHub = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Button
        variant="contained"
        onClick={() => signIn('github')}
        startIcon={<LockPersonIcon />}
      >
        Sign In
      </Button>
    </Box>
  )
}
export default LoginGitHub
