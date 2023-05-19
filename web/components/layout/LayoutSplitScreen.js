import { Paper, Stack } from '@mui/material'
import ResizePanel from './utils/ResizePanel'
import ScrollContainer from './ScrollContainer'
const LayoutSplitScreen = ({
  subheader,
  leftPanel,
  rightPanel,
  footer,
  rightWidth = 60,
}) => {
  return (
    <Stack height="100%" maxHeight="100%">
      {subheader && subheader}
      <Stack flex={1} alignItems="center" maxHeight="100%">
        <ResizePanel
          rightWidth={rightWidth}
          leftPanel={<ScrollContainer>{leftPanel}</ScrollContainer>}
          rightPanel={
            <Paper
              square
              elevation={0}
              sx={{ height: '100%', overflow: 'hidden' }}
            >
              <ScrollContainer spacing={0} padding={0}>
                {rightPanel}
              </ScrollContainer>
            </Paper>
          }
        />
      </Stack>
      {footer && footer}
    </Stack>
  )
}

export default LayoutSplitScreen
