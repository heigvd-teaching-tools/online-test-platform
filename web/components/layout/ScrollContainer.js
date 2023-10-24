import { Stack } from '@mui/material'
import { forwardRef } from 'react'

/*
Fill the parent container with a scrollable container.
Use absolute positioning to get the children out of the flow of the parent container,
insuring the children do not affect the size of the parent container.

The parent container must have a height and width set.
*/

const ScrollContainer = forwardRef(
  ({ children, dashed = false, ...props }, ref) => {
    console.log("ScrollContainer", props)
    return (
      <Stack
        ref={ref}
        position={'relative'}
        flex={1}
        
        height={'100%'}
        width={'100%'}
        border={dashed ? '1px dashed red' : 0}
      >
        <Stack
          position={'absolute'}
          top={0}
          left={0}
          bottom={0}
          right={0}
          overflow={'auto'}
          {...props}
        >
        
            {children}
      
        </Stack>
      </Stack>
    )
  }
)

ScrollContainer.displayName = 'ScrollContainer'
export default ScrollContainer
