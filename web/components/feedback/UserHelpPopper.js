import React, { useRef, useState, useEffect } from 'react';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import {
  IconButton,
  Paper,
  Popper,
  Stack,
  Fade,
  Box,
  Typography,
} from '@mui/material';

const UserHelpPopper = ({
  children,
  label,
  placement = 'bottom',
  mode = 'info',
  size = 'small',
  maxHeight = 700,
}) => {
  const popperRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const handleToggle = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prevOpen) => !prevOpen);
  };

  const id = open ? 'simple-popper' : undefined;

  // Function to determine the icon based on mode
  const getIcon = () => {
    switch (mode) {
      case 'help':
        return <HelpOutlineOutlinedIcon />;
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

  const handleDocumentClick = (event) => {
    if (popperRef.current && popperRef.current.contains(event.target)) {
      // If click inside the popper, do nothing
      return;
    }
    // If click outside the popper, close it
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleDocumentClick);
    } else {
      document.removeEventListener('mousedown', handleDocumentClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [open]);

  const handlePaperMouseDown = (event) => {
    event.stopPropagation();
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={0}
        alignItems="center"
        justifyContent="center"
        sx={{
          cursor: 'pointer',
        }}
        onClick={handleToggle}
      >
        <IconButton
          color={mode} // This sets the button color. You may adjust if your theme supports it.
          size={size}
          aria-label={`${mode} info`}
        >
          {getIcon()}
        </IconButton>
        {label && <Typography variant="caption">{label}</Typography>}
      </Stack>
      <Popper
        id={id}
        ref={popperRef}
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        transition
        sx={{ zIndex: 10000 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              elevation={3}
              ref={popperRef}
              onMouseDown={handlePaperMouseDown}
              onClick={(e) => e.stopPropagation()} // Prevent Click event propagation
            >
              <Stack
                p={2}
                maxWidth={600}
                maxHeight={maxHeight}
                bgcolor="background.paper"
                overflow="auto"
              >
                {children}
              </Stack>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default UserHelpPopper;
