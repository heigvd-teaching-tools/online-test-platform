import { useState, useEffect } from 'react';

import { Stack, Tabs, Tab } from "@mui/material"
import CodeEditor from '../../input/CodeEditor';

const Code = ({ code:initial, displaySolutionEditor, editorHeight, onChange }) => {
    const [ code, setCode ] = useState();
    const [ tab, setTab ] = useState(displaySolutionEditor ? 0 : 1);

    useEffect(() => {
        if (initial) {
            setCode(initial);
        }
    }, [initial]);

    return (
        <>
            {code && (
                <>
                <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
                   {displaySolutionEditor && (
                    <>
                        <Tabs value={tab} onChange={(ev, val) => setTab(val)} aria-label="code tabs">
                            <Tab 
                                label="Solution Code"  
                                value={0}
                            />
                            <Tab 
                                label="Partial Code" 
                                value={1}
                            />
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