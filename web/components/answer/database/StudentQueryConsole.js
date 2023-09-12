import React, {useCallback, useState} from "react";
import {DatabaseQueryOutputStatus} from "@prisma/client";
import InlineMonacoEditor from "../../input/InlineMonacoEditor";

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { Button, MenuItem, Stack} from "@mui/material";
import DropDown from "../../input/DropDown";
import QueryOutput from "../../question/type_specific/database/QueryOutput";
import {LoadingButton} from "@mui/lab";

const calculateOffset = (when, order) => {
    return when === "after" ? order + 1 : order;
}
const StudentQueryConsole = ({ jamSessionId, questionId, open, studentQueries , onClose }) => {

    const [ sql, setSql ] = useState("");
    const [ when, setWhen ] = useState("after")
    const [ order, setOrder ] = useState(studentQueries[0].query.order)

    const [ running, setRunning ] = useState(false);
    const [ result, setResult ] = useState(undefined);

    const runConsole = useCallback(async () => {
        setRunning(true);
        setResult({
            status: DatabaseQueryOutputStatus.RUNNING
        });
        // add sql before or after the "order" query
        const index = studentQueries.findIndex(({query}) => query.order === order)

        const response = await fetch(`/api/sandbox/jam-sessions/${jamSessionId}/questions/${questionId}/student/database/console`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: sql,
                at: calculateOffset(when, order) - 1
            })
        }).then(res => res.json());
        setResult(response);
        setRunning(false);
    }, [jamSessionId, questionId, sql, when, order, studentQueries]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Console</DialogTitle>
            <DialogContent>
                <Stack width={"600px"}>
                    <InlineMonacoEditor
                        code={sql}
                        language={'sql'}
                        onChange={(sql) => {
                            setSql(sql)
                        }}
                    />
                    <QueryOutput
                        header={
                            result?.status === DatabaseQueryOutputStatus.ERROR ?
                                result.order === calculateOffset(when, order) ? "Error at console query" : `Error at query #${result.order}`
                            : result?.status === DatabaseQueryOutputStatus.RUNNING &&
                                "Running"
                        }
                        result={result}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Stack width={"100%"} direction={"row"} spacing={1} alignItems={"center"} justifyContent={"space-between"}>
                    <Stack direction={"row"} spacing={1}>
                        <DropDown
                            size={"small"}
                            variant={"outlined"}
                            defaultValue={when}
                            onChange={(when) => {
                                setResult(undefined)
                                setWhen(when)
                            }}
                        >
                            <MenuItem value={"after"}>After</MenuItem>
                            <MenuItem value={"before"}>Before</MenuItem>
                        </DropDown>
                        <DropDown
                            size={"small"}
                            variant={"outlined"}
                            defaultValue={order}
                            onChange={(order) => {
                                setResult(undefined)
                                setOrder(order)
                            }}
                        >
                            {
                                studentQueries.map(({query}) => (
                                    <MenuItem key={query.id} value={query.order}>#{query.order} - {query.title}</MenuItem>
                                ))
                            }
                        </DropDown>
                    </Stack>
                    <Stack direction={"row"} spacing={1}>
                        <Button
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <LoadingButton
                            loading={running}
                            variant="contained"
                            color="success"
                            onClick={() => runConsole()}
                            autoFocus
                        >
                            Run
                        </LoadingButton>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    )
}

export default StudentQueryConsole;
