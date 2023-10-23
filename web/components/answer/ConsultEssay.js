import { Box } from '@mui/material'
import ContentEditor from '../input/ContentEditor'
const ConsultEssay = ({ content }) => {
  return (
    <Box p={2} pt={1} height={"100%"}>
      <ContentEditor
        id={`answer-compare-essay`}
        mode={"preview"}
        title={"Your answer"}
        rawContent={content || ''}
      />
    </Box>
  )
}

export default ConsultEssay
