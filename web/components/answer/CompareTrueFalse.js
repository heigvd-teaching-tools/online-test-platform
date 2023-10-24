import { Box, Stack, Typography } from '@mui/material'
import RadioViewer from '../input/RadioViewer'

const CompareTrueFalse = ({ mode, solution, answer }) => {
  return (
    <Stack direction="row" spacing={2} padding={2} alignItems="center">
      <RadioViewer
        mode={mode}
        isCorrect={solution === true}
        isFilled={answer === true}
      />
      <Box>
        <Typography variant="body1">True</Typography>
      </Box>
      <RadioViewer
        mode={mode}
        isCorrect={solution === false}
        isFilled={answer === false}
      />
      <Box>
        <Typography variant="body1">False</Typography>
      </Box>
    </Stack>
  )
}

export default CompareTrueFalse
