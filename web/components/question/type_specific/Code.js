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
import React, { use, useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import { Stack, Tabs, Tab, Typography, Box, TextField, Button, IconButton, Stepper, Step, StepLabel, StepConnector, FormGroup, FormControlLabel, FormHelperText, Switch } from '@mui/material'

import Sandbox from './code/codeWriting/Sandbox'
import TestCases from './code/codeWriting/TestCases'
import TabContent from '../../layout/utils/TabContent'
import SolutionFilesManager from './code/codeWriting/files/SolutionFilesManager'
import TemplateFilesManager from './code/codeWriting/files/TemplateFilesManager'
import Loading from '../../feedback/Loading'

import { fetcher } from '../../../code/utils'
import TabPanel from '../../layout/utils/TabPanel'
import { CodeQuestionType } from '@prisma/client'
import FileEditor from './code/FileEditor'
import ScrollContainer from '@/components/layout/ScrollContainer'
import InlineMonacoEditor from '@/components/input/InlineMonacoEditor'

const Code = ({ groupScope, questionId, onUpdate }) => {

  const { data: code, error } = useSWR(
    `/api/${groupScope}/questions/${questionId}/code`,
    groupScope && questionId ? fetcher : null,
    { revalidateOnFocus: false },
  )  

  return (
    <Loading loading={!code} errors={[error]}>
      <Stack overflow={'hidden'} flex={1}>
      {
        code?.codeType === CodeQuestionType.codeWriting && (
          <CodeWriting 
            groupScope={groupScope}
            questionId={questionId}
            language={code.language}
            onUpdate={onUpdate}
          />
        )
      }
      {
        code?.codeType === CodeQuestionType.codeReading && (
          <CodeReading 
            groupScope={groupScope}
            questionId={questionId}
            language={code.language}
            onUpdate={onUpdate}
          />
        )
      }
      </Stack>
    </Loading>
  )
}

const CodeWriting = ({ groupScope, questionId, language, onUpdate }) => {

  const [tab, setTab] = useState(1)

  return (
    <>
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
            language={language}
            onUpdate={onUpdate}
          />

          <TestCases
            groupScope={groupScope}
            questionId={questionId}
            language={language}
            onUpdate={onUpdate}
          />
        </TabContent>
      </TabPanel>
      <TabPanel id="solution" value={tab} index={1}>
        <TabContent>
          <SolutionFilesManager
            groupScope={groupScope}
            questionId={questionId}
            language={language}
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
    </>
  )
}

const CodeReading = ({ groupScope, questionId, language, onUpdate }) => {

  const [tab, setTab] = useState(1)
  return (
    <>
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
          label={<Typography variant="caption">Snippets</Typography>}
          value={1}
        />
      </Tabs>
      <TabPanel id="setup" value={tab} index={0}>
        <TabContent spacing={4} pt={2} px={1}>
          <Sandbox
            groupScope={groupScope}
            questionId={questionId}
            language={language}
            onUpdate={onUpdate}
          />
          <SnippetContext 
            groupScope={groupScope}
            questionId={questionId}
            onUpdate={onUpdate}
          />
        </TabContent>
      </TabPanel>
      <TabPanel id="snippets" value={tab} index={1}>
        <TabContent spacing={0}>
          <Snippets
            groupScope={groupScope}
            questionId={questionId}
            language={language}
            onUpdate={onUpdate}
          />
        </TabContent>
      </TabPanel>
    </>
  )
}

const SnippetContext = ({ groupScope, questionId, onUpdate }) => {

  const [ studentOutputTest, setStudentOutputTest ] = useState(false)
  const [ contextExec, setContextExec ] = useState('')
  const [ context, setContext ] = useState({
    path: '',
    content: '',
  })
  
  const { data: codeReading, error, mutate } = useSWR(
    `/api/${groupScope}/questions/${questionId}/code/code-reading`,
    groupScope && questionId ? fetcher : null,
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (!codeReading) return
    setStudentOutputTest(codeReading.studentOutputTest)
    setContextExec(codeReading.contextExec)
    setContext({
      path: codeReading.contextPath,
      content: codeReading.context,
    })
  }, [codeReading])

  const onCodeReadingUpdate = useCallback(
    async (updatedAttributes) => {
      fetch(
        `/api/${groupScope}/questions/${questionId}/code/code-reading`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(
            {
              ...codeReading,
              ...updatedAttributes,
            },
          ),
        },
      ).then((data) => data.json())
      mutate()
      onUpdate && onUpdate()
    },
    [groupScope, questionId, onUpdate, codeReading, mutate],
  )


  return (
    <Loading loading={!codeReading} errors={[error]}>
      <Stack spacing={1} height={'100%'} flex={1} overflow={'hidden'}>
        <ScrollContainer pb={12} spacing={1}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={studentOutputTest}
                onChange={(e) => {
                  setStudentOutputTest(e.target.checked)
                  onCodeReadingUpdate({ studentOutputTest: e.target.checked })
                }}
              />
            }
            label="Student output testing"
          />
          <FormHelperText>Allow students to test their outputs. The students will know if their output is correct or not.</FormHelperText>
        </FormGroup>
                
        <Stack direction={'row'} spacing={0} alignItems={'center'}>
          <Typography variant="h6">Snippet execution context</Typography>
          <UserHelpPopper alwaysShow placement='top' mode='info'>
            <Box>
              <Typography variant="body2">Each snippet will run in isolation within the context, the program is executed for each snippet.</Typography>
              <Typography variant="body2">The context is not directly visible by students. You can use this context to add any required dependencies, functions, or variables</Typography>
              <Typography variant="body2"><code><b>{"{{SNIPPET_FUNCTION_DECLARATIONS}}"}</b></code> indicate where the the snippet wrapper functions will be generated</Typography>
              <Typography variant="body2"><code><b>{"{{SNIPPET_FUNCTION_CALLS}}"}</b></code> indicate where the the snippet execution dispatcher will be generated</Typography>
            </Box>
          </UserHelpPopper>
        </Stack>
              
        <TextField
          id="context"
          variant="standard"
          label="Context Exec"
          value={contextExec}
          multiline
          fullWidth
          onChange={(ev) => {
            setContextExec(ev.target.value)
            onCodeReadingUpdate({ contextExec: ev.target.value })
            
          }}
        />
                
        <FileEditor
          file={context}
          onChange={(code) => {
            setContext(code);
            onCodeReadingUpdate({
              context: code.content,
              contextPath: code.path,
            })
          }}
        />
          
      </ScrollContainer>
      </Stack>      
    </Loading>
  )
}

import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import BottomCollapsiblePanel from '@/components/layout/utils/BottomCollapsiblePanel'
import BottomPanelContent from '@/components/layout/utils/BottomPanelContent'
import BottomPanelHeader from '@/components/layout/utils/BottomPanelHeader'
import { useDebouncedCallback } from 'use-debounce'

const SnippetStatus = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  RUNNING: 'RUNNING',
};

const Snippets = ({ groupScope, questionId, language, onUpdate }) => {

  const [ lock, setLock ] = useState(false)
  const [ statuses, setStatuses ] = useState([])
  const [ snippets, setSnippets ] = useState([])

  const { data, error, mutate } = useSWR(
    `/api/${groupScope}/questions/${questionId}/code/code-reading/snippets`,
    groupScope && questionId ? fetcher : null,
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (!data) return
    setSnippets(data)
    setStatuses(data.map((snippet) => {
      if (!snippet.output) return SnippetStatus.ERROR

      return SnippetStatus.SUCCESS
    }))
  }, [data])

  const onAddSnippet = useCallback(
    async () => {
      setLock(true)
      await fetch(`/api/${groupScope}/questions/${questionId}/code/code-reading/snippets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({order: snippets.length}),
      }).then((data) => data.json())
      setLock(false)
      onUpdate && onUpdate()
      mutate()
    },
    [groupScope, questionId, onUpdate, snippets, mutate],
  )

  const onUpdateSnippet = useCallback(
    async (snippetId, snippet) => {
      const body = {
        snippet: snippet.snippet || '',
        output: snippet.output || '',
      }
      setLock(true)
      await fetch(`/api/${groupScope}/questions/${questionId}/code/code-reading/snippets/${snippetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((data) => data.json())
      mutate()
      onUpdate && onUpdate()
      setLock(false)
    },
    [groupScope, questionId, onUpdate, mutate],
  )

  const debouncedUpdateSnippet = useDebouncedCallback(onUpdateSnippet, 500)

  const onUpdateSnippets = useCallback(
    async (snippets) => {
      snippets.forEach(async (snippet) => {
        await onUpdateSnippet(snippet.id, snippet)
      })
    },
    [onUpdateSnippet],
  )

  const onDeleteSnippet = useCallback(
    async (snippetId) => {
      setLock(true)
      await fetch(`/api/${groupScope}/questions/${questionId}/code/code-reading/snippets/${snippetId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }).then((data) => data.json())
      mutate()
      setLock(false)
      onUpdate && onUpdate()
      
    },
    [groupScope, questionId, onUpdate],
  )

  const onBeforeRun = useCallback(
    () => {
      setStatuses(snippets.map(() => SnippetStatus.RUNNING))
    },
    [snippets],
  )

  const onAfterRun = useCallback(
    (result) => {

      const snippetsWithTests = snippets.map((snippet, index) => {
        const test = result.tests[index]
        return {
          ...snippet,
          output: test?.output || undefined
        }
      })

      setStatuses(snippetsWithTests.map((snippet, index) => {
        if (!result.tests || !result.tests[index]) {
          return SnippetStatus.ERROR
        }

        if (snippet.output) {
          return SnippetStatus.SUCCESS
        }

        return SnippetStatus.ERROR
      }))
      
      const updatedSnippets = snippets.map((snippet, index) => {
        const test = result.tests[index]
        return {
          ...snippet,
          output: test?.output || undefined
        }
      })
      setSnippets(updatedSnippets)
      onUpdateSnippets(updatedSnippets)


    },
    [onUpdateSnippet, snippets, onUpdateSnippets],
  )

  return (
    <Loading loading={!snippets} errors={[error]}>
        <Stack  
          direction={'row'}
          alignItems={'center'}
          p={1}
        >
          <Button 
            onClick={onAddSnippet
          }>Add Snippet</Button>
        </Stack>
        
        <SnippetStatuBar statuses={statuses} />

        <Stack flex={1}>
        {
            snippets && (
              <BottomCollapsiblePanel
                bottomPanel={
                  <RunSnippets 
                    lock={lock}
                    questionId={questionId}
                    onBeforeRun={onBeforeRun}
                    onUpdate={onAfterRun}
                  />
                }
              >
              {
                snippets.map((snippet, index) => (
                  <SnippetEditor
                    key={index}
                    index={index}
                    snippet={snippet}
                    language={language}
                    onChange={(code) => {
                      const updatedSnippets = snippets.map((s, i) => {
                        if (i === index) {
                          return {
                            ...s,
                            snippet: code,
                          }
                        }
                        return s
                      })
                      setSnippets(updatedSnippets)
                      const updatedStatuses = updatedSnippets.map((s, i) => {
                        if (!s.output) return SnippetStatus.ERROR
                        // set the current snippet status to error 
                        if (i === index) return SnippetStatus.ERROR
                        return SnippetStatus.SUCCESS
                      })
                      setStatuses(updatedStatuses)
                      debouncedUpdateSnippet(snippet.id, {
                        ...snippet,
                        snippet: code,
                        output: null,
                      })
                    
                    }}
                    onDelete={onDeleteSnippet}
                  />
                ))
              }
              </BottomCollapsiblePanel>
            )
        }
        </Stack>
    </Loading>
  )
}

const SnippetEditor = ({ index, snippet, language, onChange,onDelete }) => {
  return (
    <Stack direction={'column'} key={index} spacing={1}>    
      <Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'space-between'} pl={1}>
        <Typography variant="h6">Snippet {index + 1}</Typography>
        <IconButton onClick={() => onDelete(snippet.id)} color="error">
          <DeleteForeverOutlinedIcon />
        </IconButton>
      </Stack>         
      <InlineMonacoEditor
        key={index}
        language={language}
        minHeight={60}
        code={ snippet.snippet }
        onChange={onChange}
      />
      <Box px={1}>
        <TextField
          id={`output-${index}`}
          variant="standard"
          label={`Output`}
          value={snippet?.output || ''}
          multiline
          fullWidth
          InputProps={{
            readOnly: true,
          }}
          error={snippet.output === '' || snippet.output == null}
          helperText={(snippet.output === '' || snippet.output == null) ? 'Dont forget to run the snippets to get the output' : ''}
        />
      </Box>
    </Stack>
  )
}

import { LoadingButton } from '@mui/lab';
import { useBottomPanel } from '@/context/BottomPanelContext'
import UserHelpPopper from '@/components/feedback/UserHelpPopper'
import SnippetStatuBar from './code/codeWriting/SnippetStatuBar'

const RunSnippets = ({ lock, questionId, onBeforeRun, onUpdate }) => {

  const [ result, setResult ] = useState(null)
  const [ snippetsRunning, setSnippetsRunning ] = useState(false)

  const { openPanel } = useBottomPanel()

  const onRunAll = useCallback(
    async () => {
      setSnippetsRunning(true)
      onBeforeRun && onBeforeRun()
      const result = await fetch(`/api/sandbox/${questionId}/code-reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).then((data) => data.json())
      setResult(result)
      if(result.beforeAll) {
        openPanel()
      }
      setSnippetsRunning(false)

      onUpdate && onUpdate(result)
    },
    [questionId, onUpdate],
  )

  return (
    <Stack maxHeight={'calc(100% - 90px)'}>
      <BottomPanelHeader>
        <LoadingButton
          size="small"
          variant="contained"
          color="info"
          onClick={onRunAll}
          disabled={lock}
          loading={snippetsRunning}
        >
          Run Snippets
        </LoadingButton>
      </BottomPanelHeader>
      <BottomPanelContent>
      {result && result.beforeAll && (
        <Stack padding={0}>
          <TextField
            variant="filled"
            fullWidth
            multiline
            maxRows={12}
            focused
            color="info"
            label="Console"
            value={result.beforeAll}
            InputProps={{
              readOnly: true,
            }}
          />
        </Stack>
      )}
      </BottomPanelContent>
    </Stack>
  )
}



export default Code
