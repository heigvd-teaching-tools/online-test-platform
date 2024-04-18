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
import React, { useState } from 'react'
import { Tab, Tabs, Typography, TextField, InputAdornment, Box } from '@mui/material'

import FileEditor from '@/components/question/type_specific/code/FileEditor'
import TestCaseResults from '@/components/question/type_specific/code/codeWriting/TestCaseResults'
import TabContent from '@/components/layout/utils/TabContent'
import TabPanel from '@/components/layout/utils/TabPanel'
import { CodeQuestionType } from '@prisma/client'
import InlineMonacoEditor from '../input/InlineMonacoEditor'
import AnswerCodeReadingOutputStatus from './code/codeReading/AnswerCodeReadingOutputStatus'

const ConsultCode = ({ question, answer }) => {
  const codeType = question.code.codeType
  return (
    <>
      {codeType === CodeQuestionType.codeWriting && (
        <ConsultCodeWriting
          answer={answer}
        />
      )}
      {codeType === CodeQuestionType.codeReading && (
        <ConsultCodeReading
          question={question}
          answer={answer}
        />
      )}
    </>
  )
}

const ConsultCodeWriting = ({ answer }) => {
  const [tab, setTab] = useState(0)
  const files = answer?.codeWriting?.files
  const tests = answer?.codeWriting?.tests
  return (
    files && (
      <>
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
            label={<Typography variant="caption">Tests</Typography>}
            value={1}
          />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <TabContent>
            {files.map((answerToFile, index) => (
              <FileEditor
                key={index}
                file={answerToFile.file}
                readonlyPath
                readonlyContent
              />
            ))}
          </TabContent>
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <TabContent padding={1}>
            <TestCaseResults tests={tests} />
          </TabContent>
        </TabPanel>
      </>
    )
  )
}

const ConsultCodeReading = ({ question, answer }) => {
  const language = question.code.language
  return (
    <Box pt={1}>
      {answer?.codeReading?.outputs.map((output, index) => (
        <>
          <InlineMonacoEditor
            key={index}
            language={language}
            code={output.codeReadingSnippet.snippet}
            readOnly
          />
          <Box p={1}>
            <TextField
              fullWidth
              multiline
              label="Your output"
              value={output.output}
              variant='standard'
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box pt={0.5}>
                    <AnswerCodeReadingOutputStatus
                      studentOutputTest
                      status={output.status} 
                    />
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </>
      ))}
    </Box>
  )
}


export default ConsultCode
