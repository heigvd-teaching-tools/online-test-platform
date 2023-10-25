import { Stack, Typography } from '@mui/material'
import WebEditor from '../question/type_specific/web/WebEditor'
import PreviewPanel from '../question/type_specific/web/PreviewPanel'
import ResizePanel from '../layout/utils/ResizePanel'
import ScrollContainer from '../layout/ScrollContainer'

const ConsultWeb = ({ answer }) => {
  
  return (
    <Stack mt={1} height={"100%"}>
      <ResizePanel
          leftPanel={
            <Stack spacing={0} pt={0} position={"relative"} height={"100%"}>
                <Stack p={1}>
                  <Typography variant="body1">Your Answer</Typography>
                </Stack>
                <Stack flex={1}>
                  <ScrollContainer>
                    <WebEditor
                      id={'consult-web'}
                      readOnly
                      web={answer}
                    />
                  </ScrollContainer>
                </Stack>
              </Stack>
          }
          rightPanel={
            <PreviewPanel
              id={`consult-preview`}
              web={answer}
            />
          }
      />
    </Stack>
  )
}

export default ConsultWeb
