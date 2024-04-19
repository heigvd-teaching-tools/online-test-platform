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

export default Snippets;