import React, {useState, useEffect, useCallback} from 'react';

import useSWR from "swr";

import { Stack, Tabs, Tab, Paper, Typography, Box } from "@mui/material"

import LanguageSelector from "./code/LanguageSelector";
import Sandbox from "./code/Sandbox";
import TestCases from "./code/TestCases";
import TabContent from "./code/TabContent";
import SolutionFilesManager from "./code/files/SolutionFilesManager";
import CodeCheck from './CodeCheck';

import languages from "./code/languages.json";
import TemplateFilesManager from "./code/files/TemplateFilesManager";

const environments = languages.environments;


const Code = ({ id = "code", where, question, onTestResult }) => {

    const { data: code, mutate, error } = useSWR(
        `/api/questions/${question.id}/code`,
        question.id ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus: false }
    );

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

    const initializeCode = useCallback(async (code) => {
        // create a code and its sub-entities
        await fetch(`/api/questions/${question.id}/code`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(codeBasedOnLanguage("cpp"))
        }).then(data => data.json())
            .then(async (data) => {
                await mutate(data);
            });

    }, [question.id, mutate]);

    const onChangeLanguage = useCallback(async (language) => {
        await fetch(`/api/questions/${question.id}/code`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(codeBasedOnLanguage(language))
        })
        .then(data => data.json())
        .then(async (data) => {
            setLanguage(data.language);
            await mutate(data);
        });
    }, [question.id, mutate]);

    return (
        code && (
            <Stack id={id} height='100%'>
                <Tabs value={tab} onChange={(ev, val) => setTab(val)} aria-label="code tabs">
                    <Tab label={<Typography variant="caption">Setup</Typography>} value={0} />
                    <Tab label={<Typography variant="caption">Solution</Typography>} value={1} />
                    <Tab label={<Typography variant="caption">Template</Typography>} value={2} />
                </Tabs>
                <TabPanel id="setup" value={tab} index={0}>
                    <TabContent padding={2} spacing={2}>
                        <Box>
                            { language && (
                                <LanguageSelector
                                    language={language}
                                    onChange={onChangeLanguage}
                                />
                            )}

                        </Box>

                        <Sandbox
                            question={question}
                            language={language}

                        />

                        <TestCases
                            question={question}
                            language={language}

                        />
                    </TabContent>

                </TabPanel>
                <TabPanel id="solution" value={tab} index={1}>
                    <TabContent>
                        <SolutionFilesManager
                            language={language}
                            question={question}
                        />
                    </TabContent>
                </TabPanel>
                <TabPanel id="template" value={tab} index={2}>
                    <TabContent>
                        <TemplateFilesManager
                            type={"template"}
                            question={question}
                        />
                    </TabContent>
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

const TabPanel = ({ children, value, index }) => value === index && children;

const codeBasedOnLanguage = (language) => {
    const index = environments.findIndex(env => env.language === language);
    return {
        language: environments[index].language,
        sandbox: {
            image: environments[index].sandbox.image,
            beforeAll: environments[index].sandbox.beforeAll

        },
        files: {
            template: environments[index].files.template,
            solution: environments[index].files.solution
        },
        testCases: environments[index].testCases
    }
}


export default Code;
