import {Box, Stack, Tab, Tabs, Typography} from "@mui/material";
import FileEditor from "../question/type_specific/code/files/FileEditor";
import TestCaseResults from "../question/type_specific/code/TestCaseResults";
import React from "react";
import TabContent from "../question/type_specific/code/TabContent";
import TabPanel from "../layout/utils/TabPanel";

const ConsultCode = ({ files, tests }) => {
    const [ tab, setTab ] = React.useState(0);
    return(
        files && (
            <Box>
                <Tabs value={tab} onChange={(ev, val) => setTab(val)} aria-label="code tabs">
                    <Tab label={<Typography variant="caption">Code</Typography>} value={0} />
                    <Tab label={<Typography variant="caption">Tests</Typography>} value={1} />
                </Tabs>
                <TabPanel value={tab} index={0}>
                    <TabContent>
                        <Stack position="relative" height="100%" border="1px solid red">
                            <Box height="100%" overflow="auto" pb={16}>
                                { files.map((answerToFile, index) => (
                                    <FileEditor
                                        key={index}
                                        file={answerToFile.file}
                                        readonlyPath
                                        readonlyContent
                                    />
                                ))}
                            </Box>
                        </Stack>
                    </TabContent>
                </TabPanel>
                <TabPanel value={tab} index={1}>
                    <TabContent>
                        <TestCaseResults tests={tests} />
                    </TabContent>
                </TabPanel>
            </Box>
        )
    )
}



export default ConsultCode;
