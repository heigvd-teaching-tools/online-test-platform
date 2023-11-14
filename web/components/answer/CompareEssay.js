import { Box } from '@mui/material'
import ContentEditor from '@/components/input/ContentEditor'
import ResizePanel from '@/components/layout/utils/ResizePanel'

const CompareEssay = ({ solution, answer }) => {
  return (
    <Box p={2} pt={0} height={"100%"}>
      <ResizePanel
        leftPanel={
          <ContentEditor
            mode={"preview"}
            title={"Student's answer"}
            id={`answer-compare-essay`}
            rawContent={answer || ''}
          />
        }
        rightPanel={
          <ContentEditor
            mode={"preview"}
            title={"Solution"}
            id={`solution-compare-essay`}
            rawContent={solution.solution || ''}
          />
        }
      />
    </Box>
  )
}

export default CompareEssay
