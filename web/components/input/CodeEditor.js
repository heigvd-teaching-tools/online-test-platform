import React, { useState, useEffect } from 'react';
import { Collapse , Paper, Button, TextField, Stack, Box } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import Editor from "@monaco-editor/react";

import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import {ResizeObserverProvider, useResizeObserver} from "../../context/ResizeObserverContext";

const CodeEditor = ({ id = "code-editor", code:initial, readOnly = false, onChange }) => {

    const [ codeRunning, setCodeRunning ] = useState(false);
    const [ code, setCode ] = useState(initial || "");
    const [ result, setResult ] = useState('');
    const [ expanded, setExpanded ] = useState(false);

    useEffect(() => {
        setCode(initial);
        setResult('');
        setExpanded(false);
    }, [id, initial]);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const onCodeChange = (newCode) => {
        setCode(newCode);
        if(newCode !== initial) {
            onChange(newCode);
        }
    }

    const runCode =  () => {
        setCodeRunning(true);
        fetch('/api/code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        })
        .then(res => res.text())
        .then(data => {
            setCodeRunning(false);
            setResult(data);
            setExpanded(true);
        }).catch(err => {
            setResult(err.message);
            setCodeRunning(false);
            setExpanded(true);
        });
    }

    return (
        <Stack sx={{ position:'relative', height:'100%' }}>
            <ResizeObserverProvider>
                <MonacoEditor
                    code={code}
                    readOnly={readOnly}
                    onChange={onCodeChange}
                />
            </ResizeObserverProvider>
            { !readOnly && (
                <Paper square elevation={0} sx={{ position:'absolute', bottom:0, left:0, width:'100%', p:0  }}>
                <Stack direction="row" alignItems="center" width="100%" spacing={1} sx={{ pt:1, pb:1 }}>
                    <LoadingButton
                        color="info"
                        loading={codeRunning}
                        onClick={runCode}
                        variant="outlined"
                        size="small"
                    >Run</LoadingButton>
                    <Button
                        size="small"
                        color="info"
                        startIcon={expanded ? <ExpandMore /> : <ExpandLess />}
                        onClick={handleExpandClick}>
                        Result
                    </Button>
                </Stack>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <TextField
                        label="Result"
                        id="result-display"
                        fullWidth
                        multiline
                        rows={20}
                        value={result}
                        variant="filled"
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </Collapse>
            </Paper>
            )}

        </Stack>
    )

}

const MonacoEditor = ({ code, readOnly, onChange }) => {
    const { height: containerHeight } = useResizeObserver();
    return (
        <Editor
            options={{
                readOnly
            }}
            width="100%"
            height={containerHeight}
            language="javascript"
            value={code}
            onChange={onChange}
        />
    )

}


const defaultCode = `// some comment
const HelloWorld = (a,b) => {
    return a * b;
}
console.log(HelloWorld(45,87));
`;

const defaultCodeAsync = `// some comment
(async () => {
    const response = await fetch("https://api.deezer.com/chart/0/playlists?limit=5");
    const data = await response.json();
    console.log(data.data);
})();
`;

const defaultCodeFs = `// some comment
const fs = require('fs');

fs.readdir("./", (err, files) => {
  files.forEach(file => {
    console.log(file);
  });
});
`;

const defaultIllegalOperation = `// some comment
const fs = require('fs');
const path = require('path');

fs.readdir("./", (err, files) => {
  if (err) console.error(err);

  for (const file of files) {
    fs.unlink(path.join("./", file), err => {
      if (err) { 
          console.error(err);
      }
    });
  }
});
`;


export default CodeEditor;
