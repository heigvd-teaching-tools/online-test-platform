import { FormControlLabel, FormGroup, Stack, Switch } from '@mui/material'
import ResizePanel from '../layout/utils/ResizePanel'
import WebEditor from '../question/type_specific/web/WebEditor'
import { useState } from 'react'
import PreviewPanel from '../question/type_specific/web/PreviewPanel'
import ScrollContainer from '../layout/ScrollContainer'

const CompareWeb = ({ solution, answer }) => {
  
  const [isPreviewMode, setPreviewMode] = useState(false);

  const handleToggle = () => {
    setPreviewMode(prev => !prev);
  }
  
  return (
    <Stack height={"100%"}>
      <Stack ml={1} mb={1}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={isPreviewMode}
                onChange={handleToggle}
                name="previewMode"
                color="primary"
            />
            }
            label="Preview Mode"
          />
        </FormGroup>
      </Stack>
      <Stack flex={1}>
      
      <ResizePanel
        leftPanel={
          <ScrollContainer>{
            isPreviewMode ? 
              <PreviewPanel
                id={`student-preview`}
                web={answer}
              />
            : 
              <WebEditor
                id={`web-student`}
                title={"Student Answer"}
                readOnly
                web={answer}
              />
          }</ScrollContainer>
        }
        rightPanel={
          <ScrollContainer>{
          isPreviewMode ? 
            <PreviewPanel
              id={`solution-preview`}
              web={{
                html: solution.solutionHtml,
                css: solution.solutionCss,
                js: solution.solutionJs,
              }}
            />
          :
            <WebEditor
              id={`web-solution`}
              title={"Solution"}
              readOnly
              web={{
                html: solution.solutionHtml,
                css: solution.solutionCss,
                js: solution.solutionJs,
              }}
            />
          }</ScrollContainer>
        }
      />
      
      </Stack>
    </Stack>
  )
}

export default CompareWeb
