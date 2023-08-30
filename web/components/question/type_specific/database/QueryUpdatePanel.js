import React, {useEffect, useState} from "react";
import BottomPanel from "../../../layout/utils/BottomPanel";
import {MenuItem, Stack, Tab, Tabs, TextField, Typography, Switch, FormGroup, FormControlLabel  } from "@mui/material";
import TabPanel from "../../../layout/utils/TabPanel";
import TabContent from "../../../layout/utils/TabContent";
import QueryOutput from "./QueryOutput";
import {StudentPermission, DatabaseQueryOutputTest} from "@prisma/client";
import DropDown from "../../../input/DropDown";
import InlineMonacoEditor from "../../../input/InlineMonacoEditor";

const QueryUpdatePanel = ({ index, query, queryOutput, onChange }) => {

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
                        <QueryOutputTab
                            query={query}
                            queryOutput={queryOutput}
                        />
                    </TabContent>
                </TabPanel>
                <TabPanel id="settings" value={tab} index={1}>
                    <TabContent padding={2} spacing={4}>
                        <QuerySettingsTab
                            query={query}
                            onChange={(q) => onChange(q)}
                        />
                    </TabContent>
                </TabPanel>
                <TabPanel id="template" value={tab} index={2}>
                    <TabContent padding={2} spacing={4}>
                        <QueryTemplateTab
                            query={query}
                            onChange={(q) => onChange(q)}
                        />
                    </TabContent>
                </TabPanel>
            </Stack>
        </BottomPanel>
    );
}

/*

enum DatabaseQueryOutputTest {
  MATCH_OUTPUT
  IGNORE_COLUMN_ORDER
  IGNORE_ROW_ORDER
  IGNORE_COLUMN_AND_ROW_ORDER
}
* */

const QueryOutputTab = ({ query, queryOutput, onChange }) => {

    const [ enableOutputTest, setEnableOutputTest ] = useState(query.queryOutputTests && query.queryOutputTests.length > 0)

    useEffect(() => {
        setEnableOutputTest(query.queryOutputTests && query.queryOutputTests.length > 0)
    }, [query.id])

    return (
        <Stack spacing={3} width={"100%"} pb={1}>
            <QueryOutput
                queryOutput={queryOutput}
            />
            <FormGroup>
                <FormControlLabel
                    label="Enable output tests"
                    control={
                        <Switch
                            checked={enableOutputTest}
                            onChange={(ev) => {
                                setEnableOutputTest(ev.target.checked);
                            }}
                        />
                    }
                />
            </FormGroup>

        </Stack>
    )
}

const QuerySettingsTab = ({ query, onChange }) => {

    const [ studentPermission, setStudentPermission ] = useState(query.studentPermission)
    const [ title, setTitle ] = useState(query.title)
    const [ description, setDescription ] = useState(query.description)
    const [ lintRules, setLintRules ] = useState(query.lintRules)

    useEffect(() => {
        setStudentPermission(query.studentPermission)
        setTitle(query.title || "")
        setDescription(query.description || "")
        setLintRules(query.lintRules || "")
    }, [query.id])

    return(
        <Stack spacing={3} width={"100%"}>
        <Stack direction={'row'} spacing={2}>
            <DropDown
                id={`${query.id}-student-permission`}
                name="Student Permission"
                defaultValue={studentPermission}
                minWidth="200px"
                maxWidth="200px"
                onChange={async (permission) => {
                    setStudentPermission(permission)
                    onChange({
                        ...query,
                        studentPermission: permission
                    })
                }}
            >
                <MenuItem value={StudentPermission.UPDATE}>
                    Update
                </MenuItem>
                <MenuItem value={StudentPermission.VIEW}>
                    View
                </MenuItem>
                <MenuItem value={StudentPermission.HIDDEN}>
                    Hidden
                </MenuItem>
            </DropDown>
            <TextField
                label={"Title"}
                value={title}
                fullWidth
                onChange={(ev) => {
                    setTitle(ev.target.value)
                    onChange({
                        ...query,
                        title: ev.target.value,
                    })
                }}
            />
        </Stack>
            <TextField
                label={"Description"}
                value={description}
                onChange={(ev) => {
                    setDescription(ev.target.value)
                    onChange({
                        ...query,
                        description: ev.target.value,
                    })
                }}
            />
            {
                query.studentPermission === StudentPermission.UPDATE && (
                    <TextField
                        label={"Lint Rules"}
                        value={lintRules}
                        multiline
                        fullWidth
                        minRows={3}
                        maxRows={10}
                        onChange={(ev) => {
                            setLintRules(ev.target.value)
                            onChange({
                                ...query,
                                lintRules: ev.target.value,
                            })
                        }}
                    />
                )
            }

        </Stack>

    )
}

const QueryTemplateTab = ({ query, onChange }) => {

    const [ template, setTemplate ] = useState(query.template)

    useEffect(() => {
        setTemplate(query.template)
    }, [query.id])

    return(
        <InlineMonacoEditor
            code={template}
            language={'sql'}
            readOnly={false}
            onChange={(sql) => {
                if (sql === query.template) return
                setTemplate(sql)
                onChange({
                    ...query,
                    template: sql,
                })
            }}
        />
    )
}

export default QueryUpdatePanel;
