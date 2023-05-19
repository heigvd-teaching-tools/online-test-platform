import { useState } from 'react'
import { Button, Collapse, Stack, Typography } from '@mui/material'
import UserAvatar from '../../layout/UserAvatar'
import Image from 'next/image'
import ClearIcon from '@mui/icons-material/Clear'

const GradingSigned = ({ signedBy, onUnsign, readOnly = false }) => {
  const [expanded, setExpanded] = useState(readOnly)
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ cursor: 'pointer', height: '100%', borderRadius: 1 }}
      onMouseOver={() => !readOnly && setExpanded(true)}
      onMouseOut={() => !readOnly && setExpanded(false)}
    >
      <UserAvatar collapsed={!expanded} user={signedBy} size={32} />
      <Stack alignItems="center">
        <Image
          src="/svg/grading/signed-off.svg"
          alt="Signed Off"
          layout="fixed"
          width={32}
          height={32}
        />
      </Stack>
      {!readOnly && (
        <Collapse
          in={expanded}
          timeout="auto"
          unmountOnExit
          orientation="horizontal"
        >
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
        </Collapse>
      )}
    </Stack>
  )
}

export default GradingSigned
