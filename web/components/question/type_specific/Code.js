import React, { useState } from 'react';
import useSWR from "swr";
import { Stack, Tabs, Tab, Typography, Box } from "@mui/material"

import Sandbox from "./code/Sandbox";
import TestCases from "./code/TestCases";
import TabContent from "../../layout/utils/TabContent";
import SolutionFilesManager from "./code/files/SolutionFilesManager";
import TemplateFilesManager from "./code/files/TemplateFilesManager";
import Loading from "../../feedback/Loading";
import LoadingAnimation from "../../feedback/LoadingAnimation";
const Code = ({ questionId }) => {

    const { data: code, mutate, error } = useSWR(
        `/api/questions/${questionId}/code`,
        questionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus: false }
    );

    const [ tab, setTab ] = useState(0);

    return (
        <Loading
            loading={!code}
            errors={[error]}
        >
            { code && (
                <Stack height='100%'>
                    <Tabs value={tab} onChange={(ev, val) => setTab(val)} aria-label="code tabs">
                        <Tab label={<Typography variant="caption">Setup</Typography>} value={0} />
                        <Tab label={<Typography variant="caption">Solution</Typography>} value={1} />
                        <Tab label={<Typography variant="caption">Template</Typography>} value={2} />
                    </Tabs>
                    <TabPanel id="setup" value={tab} index={0}>
                        <TabContent padding={2} spacing={4}>
                            <Sandbox
                                questionId={questionId}
                                language={code.language}
                            />

                            <TestCases
                                questionId={questionId}
                                language={code.language}
                            />
                        </TabContent>
                    </TabPanel>
                    <TabPanel id="solution" value={tab} index={1}>
                        <TabContent>
                            <SolutionFilesManager
                                questionId={questionId}
                                language={code.language}
                            />
                        </TabContent>
                    </TabPanel>
                    <TabPanel id="template" value={tab} index={2}>
                        <TabContent>
                            <TemplateFilesManager
                                questionId={questionId}
                            />
                        </TabContent>
                    </TabPanel>

                </Stack>
            )}
        </Loading>
    )
}

const TabPanel = ({ children, value, index }) => value === index && children;


export default Code;
