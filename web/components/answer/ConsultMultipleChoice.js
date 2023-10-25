import { Box, Stack, Typography } from '@mui/material'
import RadioViewer from '../input/RadioViewer'

const ConsultMultipleChoice = ({ options, answer }) => {
  return (
    <Box p={2} pt={1} height={"100%"}>
      <Stack spacing={2} padding={2}>
        {options?.map((option, index) => (
          <Stack
            key={index}
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ flex: 1 }}
          >
            <RadioViewer
              mode={"consult"}
              key={index}
              isCorrect={option.isCorrect}
              isFilled={answer.some((opt) => opt.id === option.id)}
            />
            <Box>
              <Typography variant="body1">{option.text}</Typography>
            </Box>
          </Stack>
        ))}
      </Stack>      
    </Box>
  )
}

export default ConsultMultipleChoice
