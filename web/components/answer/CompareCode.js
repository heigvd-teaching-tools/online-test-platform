import React from "react";
import {Box, Stack, Tab, Tabs, Typography} from "@mui/material";
import ResizePanel from "../layout/utils/ResizePanel";
import FileEditor from "../question/type_specific/code/files/FileEditor";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import TestCaseResults from "../question/type_specific/code/TestCaseResults";
import TabPanel from "../layout/utils/TabPanel";
import TabContent from "../layout/utils/TabContent";

const PassIndicator = ({passed}) => {
    return (
        passed ? (
            <CheckIcon sx={{ color: 'success.main', width:16, height:16 }} />
        ) : (
            <ClearIcon sx={{ color: 'error.main', width:16, height:16 }} />
        )
    )
}

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
                                answer.testCaseResults.length > 0 ? (
                                    <>
                                    <PassIndicator passed={answer.testCaseResults.every((test) => test.passed)} />
                                    <Typography variant="caption">
                                        {`${answer.testCaseResults.filter((test) => test.passed).length} / ${answer.testCaseResults.length} tests passed`}
                                    </Typography>
                                    </>
                                ) : (
                                    <Typography variant="caption">No code-check runs</Typography>
                                )
                            }

                        </Stack>
                    } value={1} />
                </Tabs>
                <TabPanel value={tab} index={0}>
                    <TabContent>
                            <ResizePanel
                                leftPanel={
                                answer.files?.map((answerToFile, index) => (
                                    <FileEditor
                                        key={index}
                                        file={answerToFile.file}
                                        readonlyPath
                                        readonlyContent
                                    />
                                ))
                                }
                                rightPanel={
                                    solution.solutionFiles?.map((solutionToFile, index) => (
                                        <FileEditor
                                            key={index}
                                            file={solutionToFile.file}
                                            readonlyPath
                                            readonlyContent
                                        />
                                    ))
                                }
                                rightWidth={solution.solutionFiles?.length > 0 ? 20 : 0}
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
