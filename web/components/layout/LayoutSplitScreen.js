import { Paper, Stack } from '@mui/material'
import ResizePanel from './utils/ResizePanel'
import ScrollContainer from './ScrollContainer'

const LayoutSplitScreen = ({
    subheader,
    leftPanel,
    rightPanel,
    footer,
    rightWidth = 60,
    height = "100%",
    useScrollContainer = true
}) => {
  return (
    <Stack height={height} maxHeight={height} minHeight={height}>
      {subheader && subheader}
      <Stack flex={1} alignItems="center" maxHeight="100%">
        <ResizePanel
          rightWidth={rightWidth}
          leftPanel={
            <ScrollContainer>
              {leftPanel}
            </ScrollContainer>
          }
          rightPanel={
            <Paper square elevation={0} sx={{ height: '100%', overflow: 'hidden' }}>
                {useScrollContainer ? (
                  <ScrollContainer spacing={0} padding={0}>
                    {rightPanel}
                  </ScrollContainer>
                ) : (
                    rightPanel
                )}
            </Paper>
          }
        />
      </Stack>
      {footer && footer}
    </Stack>
  )
}

export default LayoutSplitScreen
