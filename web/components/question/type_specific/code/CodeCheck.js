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
import BottomPanel from "../../../layout/utils/BottomPanel";

const CodeCheck = ({ codeCheckAction, lockCodeCheck = false }) => {
  const { show: showSnackbar } = useSnackbar()

  const [beforeAll, setBeforeAll] = useState(null)
  const [tests, setTests] = useState([])
  const [codeCheckRunning, setCodeCheckRunning] = useState(false)
  const [expanded, setExpanded] = useState(false)

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
        setExpanded(true)
      })
      .catch((_) => {
        showSnackbar('Error running test', 'error')
        setTests(null)
        setBeforeAll(null)
        setCodeCheckRunning(false)
        setExpanded(true)
      })
  }, [codeCheckAction, showSnackbar])

  return (
    <BottomPanel
        header={
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                p={1}
                pb={2}
                pt={2}
            >
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
            </Stack>
        }

        onChange={setExpanded}
        open={expanded}
    >
        {tests && (
          <Stack>
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
            <Stack spacing={1} direction="row" pb={2}>
              <TestCaseResults tests={tests} />
            </Stack>
          </Stack>
        )}
    </BottomPanel>
  )
}

export default CodeCheck
