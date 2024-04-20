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
import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/code/utils'
import SnippetEditor from './SnippetEditor'
import RunSnippets from './RunSnippets'
import Loading from '@/components/feedback/Loading'
import { Button, Stack } from '@mui/material'
import { useDebouncedCallback } from 'use-debounce'
import SnippetStatuBar from './SnippetStatuBar'
import BottomCollapsiblePanel from '@/components/layout/utils/BottomCollapsiblePanel'

const SnippetStatus = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  RUNNING: 'RUNNING',
}

const Snippets = ({ groupScope, questionId, language, onUpdate }) => {
  const [lock, setLock] = useState(false)
  const [statuses, setStatuses] = useState([])

  const { data, error, mutate } = useSWR(
    `/api/${groupScope}/questions/${questionId}/code/code-reading/snippets`,
    groupScope && questionId ? fetcher : null,
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (!data) return
    setStatuses(
      data.map((snippet) => {
        if (!snippet.output) return SnippetStatus.ERROR

        return SnippetStatus.SUCCESS
      }),
    )
  }, [data])

  const onAddSnippet = useCallback(async () => {
    setLock(true)
    await fetch(
      `/api/${groupScope}/questions/${questionId}/code/code-reading/snippets`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: statuses.length }),
      },
    ).then((data) => data.json())
    setLock(false)
    onUpdate && onUpdate()
    mutate()
  }, [groupScope, questionId, onUpdate, mutate, statuses])

  const onUpdateSnippet = useCallback(
    async (snippetId, snippet) => {
      const body = {
        snippet: snippet.snippet || '',
        output: snippet.output || '',
      }
      setLock(true)
      await fetch(
        `/api/${groupScope}/questions/${questionId}/code/code-reading/snippets/${snippetId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      ).then((data) => data.json())
      onUpdate && onUpdate()
      setLock(false)
    },
    [groupScope, questionId, onUpdate],
  )

  const debouncedUpdateSnippet = useDebouncedCallback(onUpdateSnippet, 500)

  const onDeleteSnippet = useCallback(
    async (snippetId) => {
      setLock(true)
      await fetch(
        `/api/${groupScope}/questions/${questionId}/code/code-reading/snippets/${snippetId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
      ).then((data) => data.json())
      mutate()
      setLock(false)
      onUpdate && onUpdate()
    },
    [groupScope, questionId, onUpdate, mutate],
  )

  const onBeforeRun = useCallback(() => {
    setStatuses(statuses.map(() => SnippetStatus.RUNNING))
  }, [statuses])

  const onAfterRun = useCallback(
    (result) => {
      setStatuses(
        statuses.map((_, index) => {
          if (!result.tests || !result.tests[index]) {
            return SnippetStatus.ERROR
          }

          if (result.tests[index].output) {
            return SnippetStatus.SUCCESS
          }

          return SnippetStatus.ERROR
        }),
      )
      mutate(undefined, true) // Force revalidation
    },
    [statuses, mutate],
  )

  return (
    <Loading loading={!data} errors={[error]}>
      <Stack direction={'row'} alignItems={'center'} p={1}>
        <Button onClick={onAddSnippet}>Add Snippet</Button>
      </Stack>

      <SnippetStatuBar statuses={statuses} />

      <Stack flex={1}>
        {data && (
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
            {data.map((snippet, index) => (
              <SnippetEditor
                key={index}
                index={index}
                snippet={snippet}
                language={language}
                onChange={(code) => {
                  const updatedStatuses = statuses.map((s, i) => {
                    if (i === index) return SnippetStatus.ERROR
                    return s
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
            ))}
          </BottomCollapsiblePanel>
        )}
      </Stack>
    </Loading>
  )
}

export default Snippets
