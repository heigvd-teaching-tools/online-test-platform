import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'
import { Box, Stack } from '@mui/material'
const RadioViewer = ({ mode, selected, filled }) => {
  const getIndicator = (mode, filled, selected) => {
    if (mode === 'compare') {
      if (filled && selected)
        return (
          <CheckIcon sx={{ color: `success.main`, width: 24, height: 24 }} />
        )
      if (filled && !selected)
        return <ClearIcon sx={{ color: `error.main`, width: 24, height: 24 }} />
    } else {
      return <ClearIcon sx={{ color: `info.main`, width: 24, height: 24 }} />
    }
  }
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        border: '1px solid',
        borderColor: selected ? 'success.main' : 'grey.400',
        borderRadius: 2,
        p: 1,
      }}
    >
      <Box sx={{ width: 24, height: 24 }}>
        {filled && getIndicator(mode, filled, selected)}
      </Box>
    </Stack>
  )
}
export default RadioViewer
