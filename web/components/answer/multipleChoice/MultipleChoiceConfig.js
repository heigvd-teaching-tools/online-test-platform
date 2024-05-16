import CheckboxLabel from "@/components/input/CheckboxLabel"
import { Stack } from "@mui/system"

const MultipleChoiceConfig = ({ multipleChoice }) => {
    return (
      <Stack spacing={2} direction={'row'}>
        <CheckboxLabel
          label="Comment is required"
          checked={multipleChoice.activateStudentComment}
          disabled
        />
        <CheckboxLabel 
          label={`Selection limit (${multipleChoice.selectionLimit})`}
          checked={multipleChoice.activateSelectionLimit}
          disabled
        />
      </Stack>
    )
}

export default MultipleChoiceConfig