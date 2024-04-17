import React, { useState, useCallback } from 'react'
import { Stack, TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab';
import { useBottomPanel } from '@/context/BottomPanelContext'
import BottomPanelHeader from '@/components/layout/utils/BottomPanelHeader'
import BottomPanelContent from '@/components/layout/utils/BottomPanelContent'


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

export default RunSnippets
  