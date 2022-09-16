import { useState, useEffect } from 'react';

import { IconButton, Collapse, Stack, Typography, TextareaAutosize, Button } from "@mui/material"
import { LoadingButton } from '@mui/lab';

import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

import { useSnackbar } from '../../../context/SnackbarContext';
import Row from '../../layout/Row';
import Column from '../../layout/Column';

import AlertFeedback from '../../feedback/AlertFeedback';


const CodeTestResult = ({ where, questionId, onBeforeTestRun, onTestResult }) => {
    const { show: showSnackbar } = useSnackbar();

    const [ testRunning, setTestRunning ] = useState(false);
    const [ testResult, setTestResult ] = useState(null);
    const [ expanded, setExpanded ] = useState(false);

    const runTest = async () => {
        if(onBeforeTestRun) await onBeforeTestRun();
        setTestRunning(true);
        setTestResult(null);
        fetch(`/api/code/test/${where}/${questionId}`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            setTestRunning(false);
            setTestResult(data);
            setExpanded(true);
            if(onTestResult) onTestResult(data);
        }).catch(_ => {
            showSnackbar("Error running test", "error");
            setTestResult(null);
            setTestRunning(false);
            setExpanded(true);
        });
    }

    return(
        <>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ pt:1, pb:1 }}>
                <LoadingButton size="small" variant="contained" color="info" onClick={runTest} loading={testRunning}>Test</LoadingButton>
                <Button 
                    size="small"
                    color="info"
                    startIcon={expanded ? <ExpandMore /> : <ExpandLess />}
                    onClick={() => setExpanded(!expanded)}>
                    Result
                </Button>
            </Stack>
            <Collapse in={expanded}>
                {testResult && (
                    <>
                    <Row>
                        <Column flexGrow={1}>
                            <AlertFeedback severity={testResult.success ? "success" : "error"}>{testResult.success ? "Test Successful" : "Test Failed"}</AlertFeedback>
                        </Column>
                    </Row>
                    <Row align="flex-start">
                        <Column flex={1}>
                            <Typography variant="h6">Expected Result</Typography>
                            <TextareaAutosize 
                                value={testResult.expected}
                                style={{ 
                                    width: '100%', 
                                    overflow: 'auto', 
                                    overflowY: 'hidden',
                                    whiteSpace: 'pre',
                                    resize: 'none'
                                }}
                            />
                            
                        </Column>
                        <Column flex={1}>
                            <Typography variant="h6">Your Result</Typography>
                            <TextareaAutosize
                                value={testResult.result}
                                style={{ 
                                    width: '100%', 
                                    overflow: 'auto', 
                                    overflowY: 'hidden',
                                    whiteSpace: 'pre',
                                    resize: 'none'
                                }}
                            />
                        </Column>
                    </Row>
                    </>
                )}        
            </Collapse>
        </>
    )
}

export default CodeTestResult;