import React, { useState, useEffect } from 'react';

import {Stack, Tabs, Tab, Paper, Typography, Box, TextField, MenuItem, IconButton} from "@mui/material"
import CodeEditor from '../../input/CodeEditor';
import InlineMonacoEditor from '../../input/InlineMonacoEditor';
import CodeCheck from './CodeCheck';

import SetupTab from "./code/SetupTab";
import DropDown from "../../input/DropDown";

import languages from "./code/languages.json";
import Image from 'next/image';

const environments = languages.environments;

const Code = ({ id = "code", where, questionId, code:initial, onChange, onTestResult }) => {

    /**
     code: {
            "language": "cpp",
            "solutionFiles": [],
            "templateFiles": [],
            "sandbox": null,
            "testCases": []
        } 
     */  

    const [ solutionFiles, setSolutionFiles ] = useState(initial.solutionFiles || []);
    const [ templateFiles, setTemplateFiles ] = useState(initial.templateFiles || []);

    const [ testCases, setTestCases ] = useState(initial.testCases || []);

    const [ tab, setTab ] = useState(0);

    return (
        initial && (
            <Stack id={id} height='100%' >
                <Tabs value={tab} onChange={(ev, val) => setTab(val)} aria-label="code tabs">
                    <Tab label={<Typography variant="caption">Setup</Typography>} value={0} />
                    <Tab label={<Typography variant="caption">Solution</Typography>} value={1} />
                    <Tab label={<Typography variant="caption">Template</Typography>} value={2} />
                </Tabs>
                <TabPanel id="setup" value={tab} index={0}>
                    <SetupTab
                        code={initial}
                        onChange={(what, value) => {
                            console.log("SetupTab.onChange", what, value);
                            onChange(what, value);
                        }}
                    />
                </TabPanel>
                <TabPanel id="solution" value={tab} index={1}>
                    <FilesManager
                        id={id}
                        files={solutionFiles}
                        onChange={(what, content) => {
                            
                        }}
                    />
                </TabPanel>
                <TabPanel id="template" value={tab} index={2}>
                    <FilesManager
                        id={id}
                        files={templateFiles}
                        onChange={(what, content) => {
                        }}
                    />
                </TabPanel>
                <Paper square elevation={0} maxHeight="100%" width="100%" p={0} >
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

const FilesManager = ({ id, files, onChange }) => {
    console.log("FilesManager", id, files);
    return (
        <Box height="100%" overflow="auto">
            {files.map(({path, content}, index) => {
                <FileEditor
                    id={`${id}-${index}-solution`}
                    path={path}
                    code={content}
                    secondaryActions={
                        <DropDown
                            id={`${id}-student-permission`}
                            name="Student Permission"
                            defaultValue={"Update"}
                            minWidth="200px"
                            onChange={(env) => {}}
                        >
                            <MenuItem value="Update">Update</MenuItem>
                            <MenuItem value="View">View</MenuItem>
                            <MenuItem value="Hidden">Hidden</MenuItem>
                        </DropDown>
                            
                    }
                    onChange={(newCode) => {
                        setCode({ ...code, solution: newCode});
                    }}
                />
            })}
            
        </Box>
    )
}


const languageBasedOnPathExtension = (path) => {
    const extension = path.split('.').pop();
    return languages.monacoExtensionToLanguage[extension];
}

const FileEditor = ({ id, path: initialPath, code: initialCode, secondaryActions }) => {

    // automatically set language based on path extension
    const [ language, setLanguage ] = useState(languageBasedOnPathExtension(initialPath));

    const [ path, setPath ] = useState(initialPath);
    const [ code, setCode ] = useState(initialCode);
    

    useEffect(() => {
        setLanguage(languageBasedOnPathExtension(path) || "text");
    }, [path]);

    return (
        <Stack height="100%">
            <Stack direction="row" padding={2} alignItems="center" justifyContent="flex-start">
                <TextField
                    id={`${id}-${path}`}
                    variant="standard"
                    label={`Path [syntax: ${language}]`}
                    value={path}
                    fullWidth
                    onChange={(ev) => {
                        setPath(ev.target.value);
                    }}
                />
                {secondaryActions}           
                
            
            </Stack>
            <InlineMonacoEditor
                code={code}
                language={languageBasedOnPathExtension(path)}

            />
        </Stack>
    )
}

const TabPanel = ({ children, value, index }) => value === index && children;


export default Code;
