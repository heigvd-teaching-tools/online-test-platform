import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

import MagicResizeHandle from './MagicResizeHandle'
import { Box, Stack } from '@mui/material'

const ResizePanel = ({
  leftPanel,
  rightPanel,
  rightWidth,
  height = '100%',
}) => {
 
  return useMemo(
    () => (
      <Stack
        direction={"row"}
        sx={{ height: height, width: '100%' }}
        data-testid="resize-panel"
      >
        <Box height={"100%"} minWidth={0} flex={1} overflow={"hidden"}>
          {leftPanel}
        </Box>
        <MagicResizeHandle width={rightWidth} />
        <Box height={"100%"} minWidth={0} overflow={"hidden"}>
          {rightPanel}
        </Box>
      </Stack>
    ),
    [
      leftPanel,
      rightPanel,
      height,
    ]
  )
}

ResizePanel.defaultProps = {
  rightWidth: 50,
}

ResizePanel.propTypes = {
  leftPanel: PropTypes.element.isRequired,
  rightPanel: PropTypes.element.isRequired,
  rightWidth: PropTypes.number,
}

export default ResizePanel
