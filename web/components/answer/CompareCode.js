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
import React from 'react'
import { Alert, Box, Stack, Tab, Tabs, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'

import ResizePanel from '@/components/layout/utils/ResizePanel'
import FileEditor from '@/components/question/type_specific/code/files/FileEditor'
import TestCaseResults from '@/components/question/type_specific/code/TestCaseResults'
import TabPanel from '@/components/layout/utils/TabPanel'
import TabContent from '@/components/layout/utils/TabContent'
import ScrollContainer from '@/components/layout/ScrollContainer'
import { useResizeObserver } from '@/context/ResizeObserverContext'

const PassIndicator = ({ passed }) => {
  return passed ? (
    <CheckIcon sx={{ color: 'success.main', width: 16, height: 16 }} />
  ) : (
    <ClearIcon sx={{ color: 'error.main', width: 16, height: 16 }} />
  )
}

const CompareCode = ({ solution, answer }) => {
  const [tab, setTab] = React.useState(0)

  /*  unknown issues when using 100% for the height of the Stack container -> the parent height overflows the container
        it only works well whe using px values thus the use for the ResizeObserver

    */
  const { height: containerHeight } = useResizeObserver()

  return (
    answer &&
    solution && (
      <Stack
        maxHeight={containerHeight}
        height={'100%'}
        width={'100%'}
        overflow={'auto'}
        pb={'50px'}
      >
        <Box flexGrow={1}>
          <Tabs
            value={tab}
            onChange={(ev, val) => setTab(val)}
            aria-label="code tabs"
          >
            <Tab
              label={<Typography variant="caption">Code</Typography>}
              value={0}
            />
            <Tab
              label={
                <Stack spacing={1} direction="row">
                  {answer.testCaseResults.length > 0 ? (
                    <>
                      <PassIndicator
                        passed={answer.testCaseResults.every(
                          (test) => test.passed,
                        )}
                      />
                      <Typography variant="caption">
                        {`${
                          answer.testCaseResults.filter((test) => test.passed)
                            .length
                        } / ${answer.testCaseResults.length} tests passed`}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="caption">
                      No code-check runs
                    </Typography>
                  )}
                </Stack>
              }
              value={1}
            />
            {answer.files.some(
              (ansToFile) =>
                ansToFile.file.updatedAt > answer.testCaseResults[0]?.createdAt,
            ) && (
              <Alert severity="warning">Post code-check modifications</Alert>
            )}
          </Tabs>
          <TabPanel value={tab} index={0}>
            <TabContent>
              <ResizePanel
                leftPanel={
                  <ScrollContainer>
                    {answer.files?.map((answerToFile, index) => (
                      <FileEditor
                        key={index}
                        file={answerToFile.file}
                        readonlyPath
                        readonlyContent
                      />
                    ))}
                  </ScrollContainer>
                }
                rightPanel={
                  <ScrollContainer>
                    {solution.solutionFiles?.map((solutionToFile, index) => (
                      <FileEditor
                        key={index}
                        file={solutionToFile.file}
                        readonlyPath
                        readonlyContent
                      />
                    ))}
                  </ScrollContainer>
                }
                rightWidth={solution.solutionFiles?.length > 0 ? 20 : 0}
              />
            </TabContent>
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <TabContent padding={1}>
              <TestCaseResults tests={answer.testCaseResults} />
            </TabContent>
          </TabPanel>
        </Box>
      </Stack>
    )
  )
}

export default CompareCode
