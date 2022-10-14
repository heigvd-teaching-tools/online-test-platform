import Image from 'next/image';
import {Stack} from '@mui/material';

const LoadingAnimation = ({ content, failed }) =>
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ position:'fixed', top:0, left:0, width:'100vw', height: '100%'}} >
        <Image alt="Loading..." src={failed ? '/svg/exclamation-mark.svg' : '/svg/loading.svg'} layout="fixed" width="80px" height="80px" priority="1" />
        <Stack alignItems="center">{content}</Stack>
    </Stack>;
export default LoadingAnimation;