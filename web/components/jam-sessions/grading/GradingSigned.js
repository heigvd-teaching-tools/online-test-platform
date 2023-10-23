import { Button, Stack, Typography } from '@mui/material'
import UserAvatar from '../../layout/UserAvatar'
import Image from 'next/image'
import ClearIcon from '@mui/icons-material/Clear'

const GradingSigned = ({ signedBy, readOnly, onUnsign }) => {

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ cursor: 'pointer', height: '100%', borderRadius: 1 }}
    >
      <UserAvatar user={signedBy} size={32} />
      <Stack alignItems="center">
        <Image
          src="/svg/grading/signed-off.svg"
          alt="Signed Off"
          layout="fixed"
          width={32}
          height={32}
        />
      </Stack>
       { !readOnly && (
        <Button
          size="small"
          id="grading-sign-off-remove"
          startIcon={
            <ClearIcon sx={{ color: 'error.main', width: 24, height: 24 }} />
          }
          onClick={onUnsign}
        >
          <Typography variant="body1">Unsign</Typography>
        </Button>
       )}
      
    </Stack>
  )
}

export default GradingSigned
