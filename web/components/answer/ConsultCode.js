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
import { Tab, Tabs, Typography } from '@mui/material'

import FileEditor from '@/components/question/type_specific/code/FileEditor'
import TestCaseResults from '@/components/question/type_specific/code/codeWriting/TestCaseResults'
import TabContent from '@/components/layout/utils/TabContent'
import TabPanel from '@/components/layout/utils/TabPanel'

const ConsultCode = ({ files, tests }) => {
  const [tab, setTab] = useState(0)
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

export default ConsultCode
