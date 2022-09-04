import { useState } from 'react';
import { IconButton, Collapse, Stack, Typography, TextareaAutosize } from "@mui/material"
import CodeEditor from './CodeEditor';
import { LoadingButton } from '@mui/lab';
import Row from '../../layout/Row';
import Column from '../../layout/Column';
import AlertFeedback from '../../feedback/AlertFeedback';

import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

const Code = ({ code:initial, questionId, beforeTestRun }) => {
    const [ testRunning, setTestRunning ] = useState(false);
    const [ testResult, setTestResult ] = useState(null);
    const [ expanded, setExpanded ] = useState(false);

    const runTest =  () => {
        (async () => {
            if(beforeTestRun) await beforeTestRun();
            setTestRunning(true);
            fetch(`/api/code/test/${questionId}`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: initial.code })
            })
            .then(res => res.text())
            .then(data => {
                setTestRunning(false);
                setTestResult(JSON.parse(data.replace(/\n/g, "\\n")));
                setExpanded(true);
            }).catch(err => {
                setTestResult(err.message);
                setTestRunning(false);
                setExpanded(true);
            });
        })();
    }

    return (
        <Stack direction="column" spacing={2}>
            <Row align="flex-start" padding={0}>
                <CodeEditor 
                    label="Solution Code"
                    subheader="Not visible for students."
                    code={initial.solution}
                    onChange={(newCode) => {
                        initial.solution = newCode;
                    }}
                /> 
                <CodeEditor 
                    label="Partial Code"
                    subheader="Provided to students"
                    code={initial.code}
                    onChange={(newCode) => {
                        initial.code = newCode;
                    }}
                /> 
            </Row>
            <Row padding={0}>
                <Column flexGrow={1}>
                    <LoadingButton variant="outlined" color="info" onClick={runTest} loading={testRunning}>Run Test</LoadingButton>
                </Column>
                <Column>
                    <IconButton onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </Column>
            </Row>
            
            
            <Collapse in={expanded}>
                {testResult && (
                    <>
                    <Row>
                        <Column flexGrow={1}>
                            <AlertFeedback severity={testResult.success ? "success" : "error"}>{testResult.success ? "Test Successful" : "Test Failed"}</AlertFeedback>
                        </Column>
                    </Row>
                    <Row>
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
                            <Typography variant="h6">Test Result</Typography>
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
        </Stack>
    )
}

export default Code;