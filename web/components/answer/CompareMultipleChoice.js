import { Alert, Box, Stack, Typography } from '@mui/material'
import RadioViewer from '../input/RadioViewer'
import ResizePanel from '../layout/utils/ResizePanel'

const StudentSelectionSummary = ({ options, answer }) => {
  const missedCorrect = options.filter(option => option.isCorrect && !answer.some(opt => opt.id === option.id)).length;
  const incorrectSelection = options.filter(option => !option.isCorrect && answer.some(opt => opt.id === option.id)).length;
  const correctSelection = options.filter(option => option.isCorrect && answer.some(opt => opt.id === option.id)).length;

  return (
    <Stack spacing={2} direction={"row"} width={"100%"}>
      {correctSelection > 0 && (
        <Alert severity="success">
            {correctSelection} correct option(s).
        </Alert>
      )}
      {missedCorrect > 0 && (
        <Alert severity="error">
          {missedCorrect} missed option(s).
        </Alert>
      )}
      {incorrectSelection > 0 && (
        <Alert severity="error">
          {incorrectSelection} incorrect option(s).
        </Alert>
      )}
      {missedCorrect === 0 && incorrectSelection === 0 && (
        <Alert severity="success">
          Student selected all the correct options and didn't select any incorrect option.
        </Alert>
      )}
    </Stack>
  );
};

const CompareMultipleChoice = ({ options, answer }) => {
  return (
    <Box p={2} pt={1} height={"100%"}>
      <StudentSelectionSummary options={options} answer={answer} />
      <ResizePanel
        leftPanel={
          <Stack spacing={2} padding={2}>
            <Typography variant="h6">Student's options</Typography>
            {options?.map((option, index) => (
              <Stack
                key={index}
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ flex: 1 }}
              >
                <RadioViewer
                  mode={"compare"}
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
        }
        rightPanel={   
          <Stack spacing={2} padding={2}>
            <Typography variant="h6">Solution options</Typography>
            {options?.map((option, index) => (
              <Stack
                key={index}
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ flex: 1 }}
              >
                <RadioViewer
                  mode={"compare"}
                  key={index}
                  isCorrect={option.isCorrect}
                  isFilled={option.isCorrect}
                />
                <Box>
                  <Typography variant="body1">{option.text}</Typography>
                </Box>
              </Stack>
            ))}
        </Stack>
        }
      />
    </Box>
  )
}

export default CompareMultipleChoice
