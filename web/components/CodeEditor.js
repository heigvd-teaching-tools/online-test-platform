import React, { useState, useRef } from 'react';
import { Card, Collapse , CardContent, CardActions, IconButton, TextField, Stack } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import Editor from "@monaco-editor/react";

import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

const CodeEditor = ({}) => {
    const editorRef = useRef(null);

    const [ codeRunning, setCodeRunning ] = useState(false);
    const [ result, setResult ] = useState('');
    const [expanded, setExpanded] = useState(false);
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    }

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const runCode =  () => {
        let code = editorRef.current.getValue();
        setCodeRunning(true);
        fetch('/api/code', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        })
        .then(res => res.text())
        .then(data => {
            console.log("result", data);
            setCodeRunning(false);
            setResult(data);
            setExpanded(true);
        }).catch(err => {
            console.log(err);
            setResult(err.message);
            setCodeRunning(false);
            setExpanded(true);

        });
    }


    return (
        <Card variant="outlined" sx={{ flexGrow:1, pt:3, pr:2, pb:2 }}>
            <Editor
                height="350px"
                defaultLanguage="javascript"
                defaultValue={`// some comment
const HelloWorld = (a,b) => {
    return a * b;                  
}                            
console.log(HelloWorld(45,87));
                `}
                onMount={handleEditorDidMount}
            />
            <CardActions sx={{ pl:2 }}>
                <Stack direction="row" justifyContent="space-between" align="center" width="100%">
                    <LoadingButton size="small" loading={codeRunning} onClick={runCode}>Run</LoadingButton>
                    <IconButton onClick={handleExpandClick}>
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </Stack>
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit sx={{ pl:2 }}>
                <TextField
                    label="Result"
                    id="result-display"
                    fullWidth
                    multiline
                    rows={10}
                    value={result}
                    variant="filled"
                    InputProps={{
                        readOnly: true,
                    }}
                />
            </Collapse>
        </Card>
    )
    
}

export default CodeEditor;