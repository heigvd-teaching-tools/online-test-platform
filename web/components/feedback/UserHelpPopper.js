import React, { useState } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'; 
import { IconButton, Paper, Popper, Stack, Fade } from '@mui/material';

const UserHelpPopper = ({ children, placement = 'bottom', mode = "info" }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const handleToggle = (event) => {
    setOpen(!open);
    setAnchorEl(open ? null : event.currentTarget);
  };

  const id = open ? 'simple-popper' : undefined;

  // Function to determine the icon based on mode
  const getIcon = () => {
    switch (mode) {
      case 'info':
        return <InfoOutlinedIcon />;
      case 'warning':
        return <WarningAmberOutlinedIcon />;
      case 'error':
        return <ErrorOutlineOutlinedIcon />;
      case 'success':
        return <CheckCircleOutlineOutlinedIcon />;
      default:
        return <InfoOutlinedIcon />;
    }
  };

  return (
    <>
      <IconButton
        onClick={handleToggle}
        color={mode} // This sets the button color. You may adjust if your theme supports it.
        aria-label={`${mode} info`}
      >
        {getIcon()}
      </IconButton>
      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        transition
        sx={{ zIndex: 9999 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <Stack p={2} maxWidth={600} bgcolor="background.paper">
                {children}
              </Stack>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default UserHelpPopper;
