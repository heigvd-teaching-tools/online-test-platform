import {Stack, Tab, Tabs, Typography} from "@mui/material";
import {useState} from "react";
import TabPanel from "../../layout/utils/TabPanel";
import TabContent from "../../layout/utils/TabContent";
import Setup from "./database/Setup";
import useSWR from "swr";
import {fetcher} from "../../../code/utils";
import SolutionQueriesManager from "./database/SolutionQueriesManager";

const Database = ({ questionId }) => {

    const { data: database, error } = useSWR(
        `/api/questions/${questionId}/database`,
        questionId ? fetcher : null,
        { revalidateOnFocus: false }
    )

    const [tab, setTab] = useState(0)

    return (
        <Stack overflow={'hidden'} flex={1}>
            <Tabs
                value={tab}
                onChange={(ev, val) => setTab(val)}
                aria-label="database tabs"
            >
                <Tab
                    label={<Typography variant="caption">Setup</Typography>}
                    value={0}
                />
                <Tab
                    label={<Typography variant="caption">Queries</Typography>}
                    value={1}
                />
            </Tabs>
            <TabPanel id="setup" value={tab} index={0}>
                <TabContent padding={2} spacing={4}>
                    <Setup questionId={questionId} database={database} />
                </TabContent>
            </TabPanel>
            <TabPanel id="queries" value={tab} index={1}>
                <TabContent>
                    <SolutionQueriesManager questionId={questionId} />
                </TabContent>
            </TabPanel>
        </Stack>
    );
}

export default Database;
