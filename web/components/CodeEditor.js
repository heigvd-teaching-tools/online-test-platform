import React, { useState } from 'react';
import { Card, Collapse , CardActions, IconButton, TextField, Stack } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import Editor from "@monaco-editor/react";

import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

const CodeEditor = ({ content:value, onChange }) => {
    const [ codeRunning, setCodeRunning ] = useState(false);
    const [ code, setCode ] = useState(value.content);
    const [ result, setResult ] = useState('');
    const [ expanded, setExpanded ] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const onCodeChange = (code) => {
        setCode(code);
        onChange({
            content: code,
        });
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
        <Card variant="outlined" sx={{ flexGrow:1, pt:3, pr:2, pb:2 }}>
            <Editor
                height="350px"
                defaultLanguage="javascript"
                value={code}
                onChange={onCodeChange}
                saveViewState={false}
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