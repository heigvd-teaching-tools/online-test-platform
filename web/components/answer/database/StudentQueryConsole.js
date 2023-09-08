import React, {useCallback, useState} from "react";
import InlineMonacoEditor from "../../input/InlineMonacoEditor";

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { Button, MenuItem, Stack} from "@mui/material";
import DropDown from "../../input/DropDown";
import QueryOutput from "../../question/type_specific/database/QueryOutput";

const StudentQueryConsole = ({ jamSessionId, questionId, open, studentQueries , onClose }) => {

    const [ sql, setSql ] = useState("");
    const [ when, setWhen ] = useState("after")
    const [ order, setOrder ] = useState(studentQueries[0].query.order)

    const [ running, setRunning ] = useState(false);
    const [ result, setResult ] = useState(undefined);

    const runConsole = useCallback(async () => {
        setRunning(true);
        setResult(undefined);
        // add sql before or after the "order" query
        const index = studentQueries.findIndex(({query}) => query.order === order)

        const sqlQueries = studentQueries.map(({query}) => query.content)
        if (when === "after") {
            sqlQueries.splice(index + 1, 0, sql)
        }else {
            sqlQueries.splice(index, 0, sql)
        }

        const response = await fetch(`/api/sandbox/jam-sessions/${jamSessionId}/questions/${questionId}/student/database/console`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                queries: sqlQueries,
                order: order,
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
                    {
                        result && (
                            <QueryOutput
                                queryOutput={result}
                            />
                        )

                    }
                </Stack>
            </DialogContent>
            <DialogActions>
                <Stack width={"100%"} direction={"row"} spacing={1} alignItems={"center"} justifyContent={"space-between"}>
                    <Stack direction={"row"} spacing={1}>
                        <DropDown
                            name="When"
                            defaultValue={when}
                            onChange={(when) => setWhen(when)}
                        >
                            <MenuItem value={"after"}>After</MenuItem>
                            <MenuItem value={"before"}>Before</MenuItem>
                        </DropDown>
                        <DropDown
                            name="Query"
                            defaultValue={order}
                            onChange={(order) => setOrder(order)}
                        >
                            {
                                studentQueries.map(({query}) => (
                                    <MenuItem key={query.id} value={query.order}>#{query.order} - {query.title}</MenuItem>
                                ))
                            }
                        </DropDown>
                    </Stack>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => runConsole()}
                        autoFocus
                    >
                        Run
                    </Button>

                </Stack>
            </DialogActions>
        </Dialog>
    )
}

export default StudentQueryConsole;
