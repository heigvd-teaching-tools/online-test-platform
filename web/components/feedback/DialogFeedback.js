import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
const DialogFeedback = ({ open, title, content, confirmButtonProps = {}, onClose, onConfirm }) => {
  const handleCancel = () => {
    onClose && onClose()
  }

  const handleConfirm = () => {
    onConfirm && onConfirm()
    onClose && onClose()
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          {onConfirm && (
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirm}
              autoFocus
              {...confirmButtonProps}
            >
              Confirm
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default DialogFeedback
