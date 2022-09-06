import Image from 'next/image';
import { Stack, Typography } from '@mui/material';

const LoadingAnimation = ({text = ""}) => 
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ position:'fixed', top:0, left:0, width:'100vw', height: '100%'}} >
        <Image alt="Loading..." src="/loading.svg" layout="fixed" width="80px" height="80px" priority="1" />
        <Typography variant="body1">{text}</Typography>
    </Stack>;
export default LoadingAnimation;