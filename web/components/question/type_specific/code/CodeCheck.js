import { useState, useCallback } from 'react'

import {
  Stack,
  Typography,
  Alert,
  TextField,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

import { useSnackbar } from '../../../../context/SnackbarContext'
import TestCaseResults from './TestCaseResults'
import BottomPanelHeader from '../../../layout/utils/BottomPanelHeader'
import BottomPanelContent from '../../../layout/utils/BottomPanelContent'
import { useBottomPanel } from '../../../../context/BottomPanelContext'

const CodeCheck = ({ codeCheckAction, lockCodeCheck = false }) => {
  const { show: showSnackbar } = useSnackbar()

  const [beforeAll, setBeforeAll] = useState(null)
  const [tests, setTests] = useState([])
  const [codeCheckRunning, setCodeCheckRunning] = useState(false)
  const { openPanel } = useBottomPanel();

  const runCodeCheck = useCallback(async () => {
    setCodeCheckRunning(true)
    setTests(null)
    setBeforeAll(null)
    codeCheckAction()
      .then((res) => res.json())
      .then((data) => {
        setCodeCheckRunning(false)
        setTests(data.tests)
        setBeforeAll(data.beforeAll)
        openPanel();
      })
      .catch((_) => {
        showSnackbar('Error running test', 'error')
        setTests(null)
        setBeforeAll(null)
        setCodeCheckRunning(false)
        openPanel();
      })
  }, [codeCheckAction, showSnackbar, openPanel])

  return (
    <Stack maxHeight={"calc(100% - 90px)"}>
      <BottomPanelHeader>
          <LoadingButton
              size="small"
              variant="contained"
              color="info"
              onClick={runCodeCheck}
              disabled={lockCodeCheck}
              loading={codeCheckRunning}
          >
              Code Check
          </LoadingButton>
      </BottomPanelHeader>
      <BottomPanelContent>
        {tests && (
          <Stack>
            { tests.length > 0 && (
              <Alert
                severity={
                  tests.every((result) => result.passed) ? 'success' : 'error'
                }
              >
                <Typography variant="body2">
                  {tests.every((test) => test.passed)
                    ? 'All test cases passed'
                    : `${tests.filter((test) => !test.passed).length} of ${
                        tests.length
                      } test cases failed`}
                </Typography>
             
              </Alert>
            )}
            {beforeAll && (
              <Stack padding={0}>
                <TextField
                  variant="filled"
                  fullWidth
                  multiline
                  maxRows={12}
                  focused
                  color="info"
                  label="Console"
                  value={beforeAll}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Stack>
            )}
            { tests.length > 0 && (
              <Stack spacing={1} direction="row" pb={2}>
                <TestCaseResults tests={tests} />
              </Stack>
            )}
          </Stack>
        )}
        </BottomPanelContent>
    </Stack>
  )
}

export default CodeCheck
