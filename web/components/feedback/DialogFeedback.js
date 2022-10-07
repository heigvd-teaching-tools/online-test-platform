import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const DialogFeedback = ({ open, title, content, onClose, onConfirm }) => {
  
    const handleCancel = () => {
        onClose(false);
    };
  
    const handleConfirm = () => {
        onClose(false);
        onConfirm && onConfirm();
    };
  
    return (
      <div>
        <Dialog
          open={open}
          onClose={handleCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {title}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {content}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel}>Cancel</Button>
            { onConfirm && (
              <Button variant="contained" color="success" onClick={handleConfirm} autoFocus>
                Confirm
              </Button>
            )}
            
          </DialogActions>
        </Dialog>
      </div>
    );
  }

export default DialogFeedback;