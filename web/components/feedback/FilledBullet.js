import Image from 'next/image'
import { Stack } from '@mui/material'

const FilledBullet = ({ isFilled }) => {
  
  return ( 
    <Stack
      sx={{ width: '20px', height: '20px' }}
      alignItems="center"
      justifyContent="center"
    >
      <Image
          src={isFilled ? "/svg/answer/present.svg" : "/svg/answer/empty.svg"}
          alt="answer"
          layout="fixed"
          width={12}
          height={12}
        />
      
    </Stack>
  )
}
export default FilledBullet
