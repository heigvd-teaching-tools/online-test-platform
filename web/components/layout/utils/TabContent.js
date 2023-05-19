import React from 'react'
import { Stack } from '@mui/material'

const TabContent = ({ children, padding = 0, spacing = 0 }) => (
  <Stack direction="column" padding={padding} spacing={spacing} height={'100%'}>
    {children}
  </Stack>
)

export default TabContent
