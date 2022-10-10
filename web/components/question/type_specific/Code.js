import { useState, useEffect, useCallback } from 'react';

import { Stack, Tabs, Tab, Paper } from "@mui/material"
import CodeEditor from '../../input/CodeEditor';
import CodeCheck from './CodeCheck';

const Code = ({ id = "code", where, questionId, code:initial, displaySolutionEditor, containerHeight, onChange, onTestResult }) => {

    const [ code, setCode ] = useState();
    const [ tab, setTab ] = useState(displaySolutionEditor ? 0 : 1);
    const [ editorHeight, setEditorHeight ] = useState(containerHeight);

    useEffect(() => {
        if (initial) {
            setCode(initial);
        }
    }, [initial, id]);

    const runTestRef = useCallback(node => {
        if (node !== null) {
            setEditorHeight(containerHeight - node.clientHeight);
        }
    }, [containerHeight]);

    return (
        <>
            {code && (
                <>
                <Stack id={id} direction="column" spacing={2} sx={{ width: '100%', position: 'relative', overflow: 'auto', pb: '44px' }}>
                   {displaySolutionEditor && (
                    <>
                        <Tabs value={tab} onChange={(ev, val) => setTab(val)} aria-label="code tabs">
                            <Tab label="Solution Code" value={0} />
                            <Tab label="Partial Code" value={1} />
                        </Tabs>
                        
                        <TabPanel 
                            id="solution"
                            value={tab}
                            index={0}
                            >
                            <CodeEditor 
                                editorHeight={editorHeight}
                                code={initial.solution}
                                onChange={(newCode) => {
                                    setCode({
                                        ...code,
                                        solution: newCode
                                    });
                                    if(onChange) onChange("solution", newCode);
                                }}
                            />  
                        </TabPanel>
                    </>
                    )}
                    <TabPanel 
                        value={tab}
                        index={1}
                    >
                        <CodeEditor
                            id={`${id}-partial`}
                            editorHeight={editorHeight}
                            code={initial.code}
                            onChange={(newCode) => {
                                setCode({
                                    ...code,
                                    code: newCode
                                });
                                if(onChange) onChange("code", newCode);
                            }}
                        /> 
                    </TabPanel>
                    <Paper ref={runTestRef} square elevation={0} sx={{ position:'absolute', bottom:0, left:0, maxHeight: `${containerHeight}px`, width:'100%', p:0  }}>
                        <CodeCheck
                            id={`${id}-test-run`}
                            where={where} 
                            questionId={questionId} 
                            onTestResult={onTestResult}
                        />
                    </Paper>
                </Stack>
                </>
            )}
        </>
    )
}

const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
)


export default Code;