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
import useSWR from 'swr'
import { Stack, Tabs, Tab, Typography } from '@mui/material'

import Sandbox from './code/Sandbox'
import TestCases from './code/TestCases'
import TabContent from '../../layout/utils/TabContent'
import SolutionFilesManager from './code/files/SolutionFilesManager'
import TemplateFilesManager from './code/files/TemplateFilesManager'
import Loading from '../../feedback/Loading'

import { fetcher } from '../../../code/utils'
import TabPanel from '../../layout/utils/TabPanel'

const CodeWriting = ({ groupScope, questionId, onUpdate }) => {
  const { data: code, error } = useSWR(
    `/api/${groupScope}/questions/${questionId}/code/code-writing`,
    groupScope && questionId ? fetcher : null,
    { revalidateOnFocus: false },
  )

  

  const [tab, setTab] = useState(1)

  return (
    <Loading loading={!code} errors={[error]}>
      {code && (
        <Stack overflow={'hidden'} flex={1}>
          <Tabs
            value={tab}
            onChange={(ev, val) => setTab(val)}
            aria-label="code tabs"
          >
            <Tab
              label={<Typography variant="caption">Setup</Typography>}
              value={0}
            />
            <Tab
              label={<Typography variant="caption">Solution</Typography>}
              value={1}
            />
            <Tab
              label={<Typography variant="caption">Template</Typography>}
              value={2}
            />
          </Tabs>
          <TabPanel id="setup" value={tab} index={0}>
            <TabContent padding={2} spacing={4}>
              <Sandbox
                groupScope={groupScope}
                questionId={questionId}
                language={code.language}
                onUpdate={onUpdate}
              />

              <TestCases
                groupScope={groupScope}
                questionId={questionId}
                language={code.language}
                onUpdate={onUpdate}
              />
            </TabContent>
          </TabPanel>
          <TabPanel id="solution" value={tab} index={1}>
            <TabContent>
              <SolutionFilesManager
                groupScope={groupScope}
                questionId={questionId}
                language={code.language}
                onUpdate={onUpdate}
              />
            </TabContent>
          </TabPanel>
          <TabPanel id="template" value={tab} index={2}>
            <TabContent>
              <TemplateFilesManager
                groupScope={groupScope}
                questionId={questionId}
                onUpdate={onUpdate}
              />
            </TabContent>
          </TabPanel>
        </Stack>
      )}
    </Loading>
  )
}

export default CodeWriting
