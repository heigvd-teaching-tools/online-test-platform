import {useState, useEffect, useCallback} from 'react';

import { Collapse, Stack, Button } from "@mui/material"
import { LoadingButton } from '@mui/lab';

import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

import { useSnackbar } from '../../../context/SnackbarContext';
import CodeCheckResult from './CodeCheckResult';

const CodeCheck = ({ id = "test-run", where, questionId, onBeforeCodeCheckRun, onCodeCheckResult }) => {
    const { show: showSnackbar } = useSnackbar();

    const [ codeCheckRunning, setCodeCheckRunning ] = useState(false);
    const [ result, setResult ] = useState(null);
    const [ expanded, setExpanded ] = useState(false);

    useEffect(() => {
        setResult(null);
        setCodeCheckRunning(false);
        setExpanded(false);
    }, [id]);

    const runCodeCheck = useCallback(async () => {
        if(onBeforeCodeCheckRun) await onBeforeCodeCheckRun();
        setCodeCheckRunning(true);
        setResult(null);
        console.log("runCodeCheck", questionId);
        fetch(`/api/code/test/${where}/${questionId}`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            console.log(data.questionId, questionId);
            if(data.questionId === questionId){
                setCodeCheckRunning(false);
                setResult(data);
                setExpanded(true);
                if(onCodeCheckResult) onCodeCheckResult(data);
            } else {
                showSnackbar(data.success ? "Your code check passed " : "Your code check failed", data.success ? "success" : "error");
            }
        }).catch(_ => {
            showSnackbar("Error running test", "error");
            setResult(null);
            setCodeCheckRunning(false);
            setExpanded(true);
        });
    }, [id, where, questionId, onBeforeCodeCheckRun, onCodeCheckResult, showSnackbar]);

    return(
        <>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ pt:1, pb:1 }}>
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
                {result && (
                    <CodeCheckResult result={result} />
                )}        
            </Collapse>
        </>
    )
}



export default CodeCheck;