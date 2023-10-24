import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const DialogHelp = ({ title, content }) => {

  return (
      <Dialog
        open={true}
        aria-labelledby="help-dialog-title"
        aria-describedby="help-dialog-description"
      >
        <DialogTitle id="help-dialog-title">
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="help-dialog-description">
            {content}
          </DialogContentText>
        </DialogContent>
      </Dialog>
  );
}

export default DialogHelp;