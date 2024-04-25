import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'

const PassIndicator = ({ passed }) => {
    return passed ? (
      <CheckIcon sx={{ color: 'success.main', width: 16, height: 16 }} />
    ) : (
      <ClearIcon sx={{ color: 'error.main', width: 16, height: 16 }} />
    )
  }

export default PassIndicator