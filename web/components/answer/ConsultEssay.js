import { Box } from '@mui/material'
import ContentEditor from '../input/ContentEditor'
const ConsultEssay = ({ content }) => {
  return (
    <Box p={2} pt={0} height={"100%"}>
      <ContentEditor
        id={`answer-compare-essay`}
        rawContent={content}
      />
    </Box>
  )
}

export default ConsultEssay
