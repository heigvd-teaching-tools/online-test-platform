import { Stack } from '@mui/material'
import { useTheme } from '@emotion/react';

const FilledBullet = ({ isFilled, color = "info", size = 12 }) => {

  const theme = useTheme();

  const bulletColor = theme.palette[color].main;
  
  return ( 
    <Stack
      sx={{ width: '20px', height: '20px' }}
      alignItems="center"
      justifyContent="center"
    >
      {
        isFilled ? <FilledBulletIcon color={bulletColor} size={size} /> : <EmptyBulletIcon color={bulletColor}  size={size} />
      }
      
    </Stack>
  )
}

const EmptyBulletIcon = ({ color, size }) => (
  <svg  width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="none" stroke={color} stroke-linecap="square" stroke-miterlimit="10" stroke-width="2" stroke-linejoin="miter" />
  </svg>
);

const FilledBulletIcon = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12,1A11,11,0,1,0,23,12,11.012,11.012,0,0,0,12,1Z" fill={color} />
  </svg>
);


export default FilledBullet
