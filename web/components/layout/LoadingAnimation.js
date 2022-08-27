import Image from 'next/image';
import { Box } from '@mui/material';

const LoadingAnimation = () => 
    <Box sx={{ display:'flex', width:'100vw', height: '100vh', alignItems:"center", justifyContent: "center" }} >
        <Image alt="Loading..." src="/loading.svg" layout="fixed" width="200px" height="200px" priority="1" />
    </Box>;
export default LoadingAnimation;