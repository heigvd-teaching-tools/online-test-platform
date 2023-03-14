import {Box, Stack, Tab, Tabs, Typography} from "@mui/material";
import FileEditor from "../question/type_specific/code/files/FileEditor";
import TestCaseResults from "../question/type_specific/code/TestCaseResults";
import React, {useState} from "react";
import TabContent from "../layout/utils/TabContent";
import TabPanel from "../layout/utils/TabPanel";

const ConsultCode = ({ files, tests }) => {
    const [ tab, setTab ] = useState(0);
    return(
        files && (
            <>
                <Tabs value={tab} onChange={(ev, val) => setTab(val)} aria-label="code tabs">
                    <Tab label={<Typography variant="caption">Code</Typography>} value={0} />
                    <Tab label={<Typography variant="caption">Tests</Typography>} value={1} />
                </Tabs>
                <TabPanel value={tab} index={0}>
                    <TabContent>

                            { files.map((answerToFile, index) => (
                                <FileEditor
                                    key={index}
                                    file={answerToFile.file}
                                    readonlyPath
                                    readonlyContent
                                />
                            ))}

                    </TabContent>
                </TabPanel>
                <TabPanel value={tab} index={1}>
                    <TabContent padding={1}>
                            <TestCaseResults tests={tests} />
                    </TabContent>
                </TabPanel>
            </>
        )
    )
}



export default ConsultCode;
