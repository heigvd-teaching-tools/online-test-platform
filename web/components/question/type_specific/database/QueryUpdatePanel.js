import React, {useState} from "react";
import BottomPanel from "../../../layout/utils/BottomPanel";
import {Stack, Tab, Tabs, Typography} from "@mui/material";
import TabPanel from "../../../layout/utils/TabPanel";
import TabContent from "../../../layout/utils/TabContent";
import QueryOutput from "./QueryOutput";

const QueryUpdatePanel = ({ index, query, output, onChange }) => {

    const [ tab, setTab ] = useState(0)

    return (
        <BottomPanel header={
            <Stack pl={1} direction={'column'} spacing={0} height={"60px"} alignItems={"flex-start"}
                   justifyContent={"center"}>
                <Typography variant="body1">{`Query #${index + 1} - ${query.title || "Untitled"}`}</Typography>
                {query.description && (
                    <Typography variant="body2">{query.description}</Typography>
                )}
            </Stack>
        }>
            <Stack bgcolor={"white"} spacing={2}>
                <Tabs
                    value={tab}
                    onChange={(ev, val) => setTab(val)}
                    aria-label="query panel tabs"
                >
                    <Tab
                        label={<Typography variant="caption">Output</Typography>}
                        value={0}
                    />
                    <Tab
                        label={<Typography variant="caption">Settings</Typography>}
                        value={1}
                    />
                    <Tab
                        label={<Typography variant="caption">Template</Typography>}
                        value={2}
                    />
                </Tabs>
                <TabPanel id="output" value={tab} index={0}>
                    <TabContent padding={2} spacing={4}>
                        <QueryOutput
                            output={output}
                        />
                    </TabContent>
                </TabPanel>
                <TabPanel id="settings" value={tab} index={1}>
                    <TabContent padding={2} spacing={4}>
                        <Stack direction={'row'} spacing={2}>
                            <Typography variant="body1">Settings</Typography>
                        </Stack>
                    </TabContent>
                </TabPanel>
                <TabPanel id="template" value={tab} index={2}>
                    <TabContent padding={2} spacing={4}>
                        <Stack direction={'row'} spacing={2}>
                            <Typography variant="body1">Template</Typography>
                        </Stack>
                    </TabContent>
                </TabPanel>
            </Stack>
        </BottomPanel>
    );

}

export default QueryUpdatePanel;
