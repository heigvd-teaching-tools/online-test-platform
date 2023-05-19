import { Alert, Paper } from '@mui/material'
const AlertFeedback = ({ children, severity }) => {
  return (
    <Paper>
      <Alert severity={severity}>{children}</Alert>
    </Paper>
  )
}

export default AlertFeedback
