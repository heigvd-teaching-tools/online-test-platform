import Image from 'next/image';
import { Stack } from '@mui/material';

const FilledBullet = ({ index, isFilled }) => (
    <Stack sx={{ width: '20px', height: '20px' }} alignItems="center" justifyContent="center">
    { 
        isFilled(index + 1) ? 
        <Image src="/svg/answer/present.svg" alt="Answer present" layout="fixed" width={12} height={12} />                    
        : 
        <Image src="/svg/answer/empty.svg" alt="Answer empty" layout="fixed" width={12} height={12} />                
    }
    </Stack>
);

export default FilledBullet;