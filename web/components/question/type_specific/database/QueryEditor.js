import {Chip, Stack, Typography, useTheme} from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import InlineMonacoEditor from "../../../input/InlineMonacoEditor";
import {StudentPermission} from "@prisma/client";

const QueryStudentPermission = ({ permission }) => {
    switch (permission) {
        case StudentPermission.UPDATE:
            return <Chip color={"primary"} label={"Editable"} />
        case StudentPermission.VIEW:
            return <Chip color={"info"} label={"Visible-only"} />
        case StudentPermission.HIDDEN:
            return <Chip color={"default"} label={"Hidden"} />
    }
}

const QueryEditor = ({ index, active, query, onChange, headerLeft, headerRight }) => {



    const [ solution, setSolution ] = useState(query.solution)

    useEffect(() => {
        setSolution(query.solution)
    }, [query])

    const debouncedOnChange = useCallback(onChange, 500)

    return(
        <>
            <Stack
                direction="row"
                position="sticky"
                top={0}
                spacing={1}
                p={2}
                alignItems="center"
                justifyContent="flex-start"
                zIndex={1}
                bgcolor="white"
            >
                <Stack direction={'row'} spacing={1} alignItems={"center"} justifyContent={"space-between"} width={"100%"}>
                    <Stack direction={"row"} flex={1} alignItems={"center"} justifyContent={"flex-start"} spacing={1}>
                        {headerLeft}
                        <Stack direction={'column'} spacing={1}>
                            <Typography variant="body1">{`#${index + 1} ${query.title || "Untitled"}`}</Typography>
                            {query.description && (
                                <Typography variant="body2">{query.description}</Typography>
                            )}
                        </Stack>
                    </Stack>
                    {
                        query.testQuery && (
                            <Chip color={"secondary"} label={"Test query"} />
                        )
                    }
                    <QueryStudentPermission permission={query.studentPermission} />
                </Stack>
            </Stack>
            <InlineMonacoEditor
                code={solution}
                language={'sql'}
                readOnly={false}
                onChange={(sql) => {
                    if (sql === query.solution) return
                    setSolution(sql)
                    debouncedOnChange({
                        ...query,
                        solution: sql,
                    })
                }}
            />
        </>
    )
}

export default QueryEditor;
