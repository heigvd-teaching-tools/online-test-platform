import { Stack } from '@mui/material'
import Image from 'next/image'
const LoadingAnimation = ({ content, failed }) => (
  <Stack
    alignItems="stretch"
    justifyContent="center"
    spacing={2}
    flex={1}
    p={2}
  >
    <Stack alignItems="center" justifyContent="center" spacing={2}>
      <Image
        alt="Loading..."
        src={failed ? '/svg/exclamation-mark.svg' : '/svg/loading.svg'}
        layout="fixed"
        width="80px"
        height="80px"
        priority="1"
      />
      <Stack alignItems="center">{content}</Stack>
    </Stack>
  </Stack>
)
export default LoadingAnimation
