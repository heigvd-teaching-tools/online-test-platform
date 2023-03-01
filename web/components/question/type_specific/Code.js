import React, {useState, useEffect, useCallback} from 'react';

import {QuestionType} from "@prisma/client";
import {Stack, Tabs, Tab, Paper, Typography, Box, TextField, MenuItem, IconButton} from "@mui/material"
import InlineMonacoEditor from '../../input/InlineMonacoEditor';
import CodeCheck from './CodeCheck';

import SetupTab from "./code/SetupTab";
import DropDown from "../../input/DropDown";

import languages from "./code/languages.json";

import useSWR from "swr";

const environments = languages.environments;

const defaultCode = {
    language: environments[0].language,
    sandbox: {
        image: environments[0].sandbox.image,
        beforeAll: environments[0].sandbox.beforeAll
    }
}

/** MODEL
 code: {
            "language": "cpp",
            "solutionFiles": [],
            "templateFiles": [],
            "sandbox": {
                "image": "cpp",
                "beforeAll": "g++ -o solution solution.cpp"
            },
            "testCases": []
        }
 */

const Code = ({ id = "code", where, question, onTestResult }) => {

    const { data: code, mutate, error } = useSWR(
        `/api/questions/${question.id}/code`,
        question.id ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus: false }
    );

     const initializeCode = useCallback(async (code) => {
         // create a code and its sub-entities
        await fetch(`/api/questions/${question.id}/code`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(defaultCode)
        }).then(data => data.json())
        .then(async (data) => {
            await mutate(data);
        });

     }, [question.id, mutate]);

    const [ tab, setTab ] = useState(0);
    const [ language, setLanguage ] = useState(code?.language);

    useEffect(() => {
        if(code === null){ // null means that the useSWR is done and there is no code, don't use undefined
            initializeCode();
        }
        if(code){
            setLanguage(code.language);
        }
    }, [code]);

    const onChangeLanguage = async (language) => {
        await fetch(`/api/questions/${question.id}/code`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                language
            })
        })
        .then(data => data.json())
        .then(async (data) => {
            console.log("data", data)
            setLanguage(data.language);
            await mutate(data);
        });
    }


    return (
        code && (
            <Stack id={id} height='100%' >
                <Tabs value={tab} onChange={(ev, val) => setTab(val)} aria-label="code tabs">
                    <Tab label={<Typography variant="caption">Setup</Typography>} value={0} />
                    <Tab label={<Typography variant="caption">Solution</Typography>} value={1} />
                    <Tab label={<Typography variant="caption">Template</Typography>} value={2} />
                </Tabs>
                <TabPanel id="setup" value={tab} index={0}>
                    <SetupTab
                        question={question}
                        language={language}
                        onChangeLanguage={onChangeLanguage}
                    />
                </TabPanel>
                <TabPanel id="solution" value={tab} index={1}>
                    <FilesManager
                        id={id}
                        files={[]}

                    />
                </TabPanel>
                <TabPanel id="template" value={tab} index={2}>
                    <FilesManager
                        id={id}
                        files={[]}
                        onChange={(what, content) => {
                        }}
                    />
                </TabPanel>
                <Paper square elevation={0} maxHeight="100%" width="100%" p={0} >
                    <CodeCheck
                        id={`${id}-test-run`}
                        where={where}
                        questionId={question.id}
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
