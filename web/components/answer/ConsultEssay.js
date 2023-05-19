import { Box } from '@mui/material'
import ContentEditor from '../input/ContentEditor'
const ConsultEssay = ({ content }) => {
  return (
    <Box sx={{ p: 2, pt: 0 }}>
      <ContentEditor
        id={`answer-compare-essay`}
        readOnly
        rawContent={content}
      />
    </Box>
  )
}

export default ConsultEssay
