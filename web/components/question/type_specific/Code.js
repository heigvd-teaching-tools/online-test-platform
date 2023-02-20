import {useState, useEffect, useCallback, useRef} from 'react';

import {Stack, Tabs, Tab, Paper, Box} from "@mui/material"
import CodeEditor from '../../input/CodeEditor';
import CodeCheck from './CodeCheck';
import {ResizeObserverProvider, useResizeObserver} from "../../../context/ResizeObserverContext";

const Code = ({ id = "code", where, questionId, code:initial, displaySolutionEditor, onChange, onTestResult }) => {
    const tabsRef = useRef();
    const codeCheckRef = useRef();

    const [ code, setCode ] = useState();
    const [ tab, setTab ] = useState(displaySolutionEditor ? 0 : 1);
    const [ editorHeight, setEditorHeight ] = useState(0);
    const { height: containerHeight } = useResizeObserver();

    useEffect(() => {
        if (initial) {
            setCode(initial);
        }
    }, [initial, id]);

    useEffect(() => {
        if (containerHeight) {
            let tabsHeight = tabsRef?.current?.clientHeight || 0;
            let codeCheckHeight = codeCheckRef?.current?.clientHeight || 0;
            let newEditorHeight = containerHeight - tabsHeight - codeCheckHeight - 22;
            setEditorHeight(newEditorHeight);
        }
    }, [containerHeight, tabsRef, codeCheckRef]);

    return (
        code && (
            <Stack id={id} sx={{ p:2, overflow: 'auto' }}>
               {displaySolutionEditor && (
                <>
                    <Tabs ref={tabsRef} value={tab} onChange={(ev, val) => setTab(val)} aria-label="code tabs">
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
                <Paper ref={codeCheckRef} square elevation={0} sx={{ maxHeight: `${containerHeight}px`, width:'100%', p:0  }}>
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
      {...other}
    >
      {value === index && children}
    </div>
)


export default Code;
