import {useState, useEffect, useCallback} from 'react';

import {Collapse, Stack, Button, Tabs, Tab, Typography, Alert, Paper} from "@mui/material"
import { LoadingButton } from '@mui/lab';

import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

import { useSnackbar } from '../../../../context/SnackbarContext';
import CodeCheckResult from './CodeCheckResult';
import AlertFeedback from "../../../feedback/AlertFeedback";

/*
    code check result example per test:
    [
        {
            "exec": "node /src/main.js",
            "input": "test world\ntest world2\ntest world3",
            "output": "TEST WORLD\nTEST WORLD2\nTEST WORLD3",
            "expectedOutput": "TEST WORLD\nTEST WORLD2\nTEST WORLD3",
            "passed": true
        },
        {
            "exec": "node /src/main.js",
            "input": "Hello World1",
            "output": "HELLO WORLD1",
            "expectedOutput": "HELLO WORLD1",
            "passed": true
        },
        {
            "exec": "node /src/main.js",
            "input": "Hello World2",
            "output": "HELLO WORLD2",
            "expectedOutput": "HELLO WORLD2",
            "passed": true
        }
    ]
* */


const CodeCheck = ({ questionId, files }) => {
    const { show: showSnackbar } = useSnackbar();

    const [ results, setResults ] = useState([]);
    const [ codeCheckRunning, setCodeCheckRunning ] = useState(false);
    const [ expanded, setExpanded ] = useState(false);
    const [ index, setIndex ] = useState(0);

    const runCodeCheck = useCallback(async () => {
        setCodeCheckRunning(true);
        setResults(null);
        fetch(`/api/sandbox/${questionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files })
        })
        .then(res => res.json())
        .then(data => {
            setCodeCheckRunning(false);
            setResults(data);
            setExpanded(true);
        }).catch(_ => {
            showSnackbar("Error running test", "error");
            setResults(null);
            setCodeCheckRunning(false);
            setExpanded(true);
        });
    }, [questionId, showSnackbar]);

    return(
        <Paper >
            <Stack direction="row" alignItems="center" spacing={1} p={1} pb={2}>
                <LoadingButton size="small" variant="contained" color="info" onClick={runCodeCheck} loading={codeCheckRunning}>Code Check</LoadingButton>
                <Button
                    size="small"
                    color="info"
                    startIcon={expanded ? <ExpandMore /> : <ExpandLess />}
                    onClick={() => setExpanded(!expanded)}>
                    Result
                </Button>
            </Stack>
            <Collapse in={expanded}>
                {results && (
                    <Stack spacing={2}>
                        <Alert severity={results.every(result => result.passed) ? "success" : "error"}>
                            <Typography variant="body2">
                                {results.every(result => result.passed) ? "All test cases passed" : `${results.filter(result => !result.passed).length} of ${results.length} test cases failed`}
                            </Typography>
                        </Alert>
                        <Stack spacing={1} direction="row" pb={2}>
                            <Tabs
                                orientation="vertical"
                                variant="scrollable"
                                value={index}
                                onChange={(e, i) => setIndex(i)}
                                >
                                {results.map((result, i) => (
                                    <Tab
                                        key={i}
                                        label={
                                        <Typography sx={{ color: result.passed ? "success.main" : "error.main" }}>
                                            { "Test Case " + (i+1) }
                                        </Typography>
                                        } value={i}
                                    />
                                ))}
                            </Tabs>
                            <CodeCheckResult result={results[index]} />
                        </Stack>
                    </Stack>
                )}
            </Collapse>
        </Paper>
    )
}



export default CodeCheck;
