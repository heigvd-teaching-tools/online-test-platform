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

import { Box, Fade, IconButton, Paper, Popper, Stack } from '@mui/material'
import { useRef, useState, useEffect } from 'react'
import SettingsIcon from '@mui/icons-material/Settings'
import CloseIcon from '@mui/icons-material/Close'

const ConfigPopper = ({
  placement = 'bottom',
  size = 'small',
  label = 'Config',
  maxHeight = 700,
  width = 600,
  color = 'primary',
  children,
}) => {
  const paperRef = useRef(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [open, setOpen] = useState(false)

  const handleToggle = (event) => {
    setAnchorEl(event.currentTarget)
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClickAway = (event) => {
    if (paperRef.current && paperRef.current.contains(event.target)) {
      // If click inside the popper, do nothing
      return
    }
    // If click outside the popper, close it
    setOpen(false)
  }

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickAway)
    } else {
      document.removeEventListener('mousedown', handleClickAway)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickAway)
    }
  }, [open])

  return (
    <Box>
      <Stack
        direction="row"
        spacing={0}
        alignItems="center"
        justifyContent="center"
        sx={{ cursor: 'pointer' }}
        onClick={handleToggle}
      >
        {label && label}
        <IconButton size={size}>
          {open ? (
            <CloseIcon color={'error'} fontSize="large" />
          ) : (
            <SettingsIcon color={color} fontSize="large" />
          )}
        </IconButton>
      </Stack>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        transition
        sx={{ zIndex: 10000, width: width }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              elevation={3}
              ref={paperRef}
              onClick={(e) => {
                e.stopPropagation()
                handleClickAway(e)
              }} // Close the popper if clicking on it
            >
              <Stack
                p={2}
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
  )
}

export default ConfigPopper
