/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useRef, useState } from 'react'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import {
  IconButton,
  Paper,
  Popper,
  Stack,
  Fade,
  Box,
  Typography,
} from '@mui/material'
import ClickAwayListener from 'react-click-away-listener'

const UserHelpPopper = ({
  children,
  label,
  placement = 'bottom',
  mode = 'info',
  size = 'small',
  maxHeight = 700,
}) => {
  const popperRef = useRef(null)

  const [anchorEl, setAnchorEl] = useState(null)

  const [open, setOpen] = useState(false)

  const handleToggle = (event) => {
    setOpen(!open)
    setAnchorEl(open ? null : event.currentTarget)
  }

  const id = open ? 'simple-popper' : undefined

  // Function to determine the icon based on mode
  const getIcon = () => {
    switch (mode) {
      case 'help':
        return <HelpOutlineOutlinedIcon />
      case 'info':
        return <InfoOutlinedIcon />
      case 'warning':
        return <WarningAmberOutlinedIcon />
      case 'error':
        return <ErrorOutlineOutlinedIcon />
      case 'success':
        return <CheckCircleOutlineOutlinedIcon />
      default:
        return <InfoOutlinedIcon />
    }
  }

  const handleClickAway = (event) => {
    // Only close if click is outside of the popper content
    if (popperRef.current && !popperRef.current.contains(event.target)) {
      console.log('handleClickAway', event.target)
      setOpen(false)
    }
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box>
        <Stack
          direction="row"
          spacing={0}
          alignItems="center"
          justifyContent="center"
          cursor={'pointer'}
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
              <Paper>
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
    </ClickAwayListener>
  )
}

export default UserHelpPopper
