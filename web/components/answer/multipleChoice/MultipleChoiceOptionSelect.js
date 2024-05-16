
import { Stack, ToggleButton, Typography } from '@mui/material'

import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'


const MultipleChoiceOptionSelect = ({ round = false, option, onSelect }) => {
    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ flex: 1, cursor: 'pointer' }}
        onClick={(ev) => {
          ev.stopPropagation()
          onSelect(option.id)
        }}
      >
        <ToggleButton
            value="correct"
            selected={option.isCorrect}
            size="small"
            color="success"
            onChange={(e) => {
                e.stopPropagation()
                onSelect(option.id)
            }}
            sx={
                round
                ? {
                    borderRadius: '50%',
                    }
                : {}
            }
        >
          {option.isCorrect ? <CheckIcon /> : <ClearIcon />}
        </ToggleButton>
  
        <Typography variant="body1">{option.text}</Typography>
      </Stack>
    )
}

export default MultipleChoiceOptionSelect
  