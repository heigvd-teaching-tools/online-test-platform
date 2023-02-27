import {useState, useEffect } from 'react';

import {Stack, Tabs, Tab, Paper, Box} from "@mui/material"
import CodeEditor from '../../input/CodeEditor';
import CodeCheck from './CodeCheck';

const Code = ({ id = "code", where, questionId, code:initial, displaySolutionEditor, onChange, onTestResult }) => {
    const [ code, setCode ] = useState();
    const [ tab, setTab ] = useState(displaySolutionEditor ? 0 : 1);

    useEffect(() => {
        if (initial) {
            setCode(initial);
        }
    }, [initial, id]);

    return (
        code && (
            <Stack id={id} sx={{ p:2, height:'100%' }}>
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
                <Paper square elevation={0} sx={{ maxHeight: `100%`, width:'100%', p:0  }}>
                    <CodeCheck
                        id={`${id}-test-run`}
                        where={where}
                        questionId={questionId}
                        onTestResult={onTestResult}
                    />
                </Paper>
            </Stack>
        )
    )
}

const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ height:'100%' }}
      {...other}
    >
      {value === index && children}
    </div>
)


export default Code;
