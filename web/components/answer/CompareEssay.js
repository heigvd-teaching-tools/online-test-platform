/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Box } from '@mui/material'
import ContentEditor from '@/components/input/ContentEditor'
import ResizePanel from '@/components/layout/utils/ResizePanel'

const CompareEssay = ({ solution, answer }) => {
  return (
    <Box p={2} pt={0} height={'100%'}>
      <ResizePanel
        leftPanel={
          <ContentEditor
            mode={'preview'}
            title={"Student's answer"}
            id={`answer-compare-essay`}
            rawContent={answer || ''}
          />
        }
        rightPanel={
          <ContentEditor
            mode={'preview'}
            title={'Solution'}
            id={`solution-compare-essay`}
            rawContent={solution.solution || ''}
          />
        }
      />
    </Box>
  )
}

export default CompareEssay
