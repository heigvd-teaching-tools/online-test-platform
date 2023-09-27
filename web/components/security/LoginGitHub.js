import LockPersonIcon from '@mui/icons-material/LockPerson'
import { signIn } from 'next-auth/react'
import { Box, Button } from '@mui/material'
import { useRouter } from 'next/router'
const LoginGitHub = () => {
    const router = useRouter();

    console.log("LoginGitHub.js: router: ", router)
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
        onClick={() => signIn('github', {
            callbackUrl: window.location.href
        })}
        startIcon={<LockPersonIcon />}
      >
        Sign In
      </Button>
    </Box>
  )
}
export default LoginGitHub
