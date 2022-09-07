import { useState, useRef } from 'react';

import { ButtonGroup, Button, Popper, Grow, Paper, ClickAwayListener, MenuList, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const MinutesSelector = ({ label, color, onClick }) => {
    const step = 5;
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(1);
  
    const handleClick = () => {
      onClick(selectedIndex * step);
    };
  
    const handleMenuItemClick = (event, index) => {
      setSelectedIndex(index);
      setOpen(false);
    };
  
    const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen);
    };
  
    const handleClose = (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }
  
      setOpen(false);
    };
  
    return (
      <>
        <ButtonGroup variant="contained" color={color} ref={anchorRef} aria-label="split button">
          <Button onClick={handleClick}>{label} {selectedIndex * step} minutes</Button>
          <Button
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper
          sx={{
            zIndex: 1,
          }}
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu" autoFocusItem>{
                    [...Array(60/step).keys()].map((item) => (
                        <MenuItem 
                            key={item * step} 
                            value={item * step}
                            selected={item === selectedIndex}
                            onClick={(event) => handleMenuItemClick(event, item)}
                        >
                            {item * step} minutes
                        </MenuItem>
                    ))
                  }</MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </>
    );
  }

  export default MinutesSelector;