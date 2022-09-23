import LockOpenIcon from '@mui/icons-material/LockOpen';
import { signIn } from 'next-auth/react';
import { Box, Button } from '@mui/material';

const LoginGitHub = () => {
    return (
        <Box sx={{ display:'flex', width:'100vw', height: '100vh', alignItems:"center", justifyContent: "center" }} >
            <Button variant="contained" onClick={() => signIn("github")} startIcon={<LockOpenIcon />}>Sign In</Button> 
        </Box>
    )
}

export default LoginGitHub;