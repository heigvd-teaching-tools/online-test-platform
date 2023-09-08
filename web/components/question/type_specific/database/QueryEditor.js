import {Chip, Stack, Typography, useTheme} from "@mui/material";
import React, {useEffect, useState} from "react";
import InlineMonacoEditor from "../../../input/InlineMonacoEditor";
import {StudentPermission} from "@prisma/client";
import {useDebouncedCallback} from "use-debounce";

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

const QueryEditor = ({ readOnly = false, hidden = false, query, onChange, headerLeft }) => {

    const [ content, setContent ] = useState(query.content)

    useEffect(() => {
        setContent(query.content)
    }, [query])

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
                            <Typography variant="body1">{`#${query.order} ${query.title || "Untitled"}`}</Typography>
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
            { !hidden && (
                <InlineMonacoEditor
                    code={content}
                    language={'sql'}
                    readOnly={readOnly}
                    onChange={(sql) => {
                        if (sql === query.content) return
                        setContent(sql)
                        onChange({
                            ...query,
                            content: sql,
                        })
                    }}
                />
            )}

        </>
    )
}

export default QueryEditor;
