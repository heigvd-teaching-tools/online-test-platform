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
import React, { useState, useRef } from 'react'

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Box,
  ClickAwayListener,
  IconButton,
  Paper,
  Popper,
  Stack,
} from '@mui/material'
import { useTheme } from '@emotion/react'

const UserHelpPopper = ({ children, content, placement = 'bottom' }) => {
  /*
  placements:
  'auto-end' | 'auto-start' | 'auto' | 'bottom-end' | 'bottom-start' | 'bottom' | 'left-end' | 'left-start' | 'left' | 'right-end' | 'right-start' | 'right' | 'top-end' | 'top-start' | 'top'
  */

  const theme = useTheme()

  const [anchorEl, setAnchorEl] = useState(null)
  const [showHelp, setShowHelp] = useState(false)

  const closeTimeout = useRef(null)

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget)
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
    setShowHelp(false)
  }

  const initiateClose = () => {
    closeTimeout.current = setTimeout(() => {
      handleClose()
    }, 100) // Delay of 500ms
  }

  const cancelClose = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current)
    }
  }

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
          <Stack
            p={0}
            borderRadius={'50%'}
            bgcolor={theme.palette.background.paper}
          >
            <IconButton
              size={'small'}
              onClick={() => setShowHelp(true)}
              color="info"
            >
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
  )
}

export default UserHelpPopper
