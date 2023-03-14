import React, {useState} from "react";
import {useResizeObserver} from "../../context/ResizeObserverContext";
import {Accordion, AccordionDetails, AccordionSummary, Box, Stack, Tab, Tabs, Typography} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ResizePanel from "../layout/utils/ResizePanel";
import FileEditor from "../question/type_specific/code/files/FileEditor";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import TestCaseResults from "../question/type_specific/code/TestCaseResults";
import TabPanel from "../layout/utils/TabPanel";
import TabContent from "../question/type_specific/code/TabContent";

const accordionSummaryHeight = 64;

const CompareCode = ({ solution, answer }) => {

    const [ tab, setTab ] = React.useState(0);

    return (
        answer && solution && (
            <Box>
                <Tabs value={tab} onChange={(ev, val) => setTab(val)} aria-label="code tabs">
                    <Tab label={<Typography variant="caption">Code</Typography>} value={0} />
                    <Tab label={
                        <Stack spacing={1} direction="row">
                            {
                                (answer.testCaseResults.every((test) => test.passed) && (
                                    <CheckIcon sx={{ color: 'success.main', width:16, height:16 }} />
                                ))
                                ||
                                (answer.testCaseResults.some((test) => !test.passed) && (
                                    <ClearIcon sx={{ color: 'error.main', width:16, height:16 }} />
                                ))
                            }
                            <Typography variant="caption">
                                {`${answer.testCaseResults.filter((test) => test.passed).length} / ${answer.testCaseResults.length} tests passed`}
                            </Typography>
                        </Stack>
                    } value={1} />
                </Tabs>
                <TabPanel value={tab} index={0}>
                    <TabContent>
                            <ResizePanel
                                leftPanel={
                                <Box border="1px solid red" borderRadius={1} padding={1}>
                                    { answer.files.map((answerToFile, index) => (
                                        <FileEditor
                                            key={index}
                                            file={answerToFile.file}
                                            readonlyPath
                                            readonlyContent
                                        />
                                    ))
                                    }
                                </Box>
                                }
                                rightPanel={
                                    solution.solutionFiles.map((solutionToFile, index) => (
                                        <FileEditor
                                            key={index}
                                            file={solutionToFile.file}
                                            readonlyPath
                                            readonlyContent
                                        />
                                    ))
                                }
                                rightWidth={solution.solution ? 20 : 0}
                            />
                    </TabContent>
                </TabPanel>
                <TabPanel value={tab} index={1}>
                    <TabContent padding={1}>
                        <TestCaseResults tests={answer.testCaseResults} />
                    </TabContent>
                </TabPanel>
            </Box>
        )
    )
}

export default CompareCode;
