// UserHelp.js
import React, { useState, useRef } from 'react';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, ClickAwayListener, IconButton, Paper, Popper, Stack } from '@mui/material';
import { useTheme } from '@emotion/react';

const UserHelpPopper = ({ children, content, placement = "bottom" }) => {

  /*
  placements:
  'auto-end' | 'auto-start' | 'auto' | 'bottom-end' | 'bottom-start' | 'bottom' | 'left-end' | 'left-start' | 'left' | 'right-end' | 'right-start' | 'right' | 'top-end' | 'top-start' | 'top'
  */

  const theme = useTheme();

  console.log("theme", theme);

  const [anchorEl, setAnchorEl] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const closeTimeout = useRef(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowHelp(false);
  };

  const initiateClose = () => {
    closeTimeout.current = setTimeout(() => {
      handleClose();
    }, 100); // Delay of 500ms
  };

  const cancelClose = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
  };

  return (
    <>
      <Box onMouseEnter={handleOpen} onMouseLeave={initiateClose}>
        {children}
      </Box>
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement={placement}
        sx={{ zIndex: 9999 }}  
        onMouseEnter={cancelClose}
        onMouseLeave={initiateClose}
      >
        
          {!showHelp && (
            <Stack p={0} borderRadius={"50%"} bgcolor={theme.palette.background.paper}>
              <IconButton size={"small"} onClick={() => setShowHelp(true)} color='info'>
                <InfoOutlinedIcon />
              </IconButton>
            </Stack>
          )}

          {showHelp && (
            <Paper>
              <Stack p={2} maxWidth={600} spacing={1}>
                {content}
              </Stack>
            </Paper>
          )}
        
      </Popper>
    </>
  );
}

export default UserHelpPopper;
