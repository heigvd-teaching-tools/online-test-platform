import { Box } from '@mui/material'
import ContentEditor from '../input/ContentEditor'
import ResizePanel from '../layout/utils/ResizePanel'
const CompareEssay = ({ solution, answer }) => {
  return (
    <Box p={2} pt={0} height={"100%"}>
      <ResizePanel
        leftPanel={
          <ContentEditor
            id={`answer-compare-essay`}
            rawContent={answer}
          />
        }
        rightPanel={
          <ContentEditor
            id={`solution-compare-essay`}
            rawContent={solution.solution || ''}
          />
        }
      />
    </Box>
  )
}

export default CompareEssay
