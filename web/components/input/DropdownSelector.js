import { useState, useRef, useEffect } from 'react';
import {
  ButtonGroup,
  Button,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Box,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const DropdownSelector = ({ label, color, options, optionInLabel, variant = "outlined", onSelect, value }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0); // Default to first option

  // Effect to update selectedIndex when value prop changes
  useEffect(() => {
    const index = options.findIndex(option => option.value === value);
    if (index !== -1) {
      setSelectedIndex(index);
    }else if(options.length > 0){
      setSelectedIndex(0);
      onSelect(options[0].value);
    }
  }, [value, options, onSelect]);

  const handleClick = () => {
    onSelect(options[selectedIndex].value);
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    onSelect(options[index].value);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  return (
    <Box>
      <ButtonGroup
        variant={variant}
        color={color}
        ref={anchorRef}
        aria-label="split button"
      >
        <Button onClick={handleClick}>
          {label && label(options[selectedIndex] || options[0])}
        </Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select option"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
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
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option.value}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
};

export default DropdownSelector;
