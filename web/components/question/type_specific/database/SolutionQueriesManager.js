import useSWR from "swr";
import { StudentPermission } from "@prisma/client";
import {fetcher} from "../../../../code/utils";
import Loading from "../../../feedback/Loading";
import {Collapse, Button, Chip, Stack, Typography, useTheme, Card, Paper, IconButton} from "@mui/material";
import React, {useCallback, useEffect, useRef, useState} from "react";
import ScrollContainer from "../../../layout/ScrollContainer";
import InlineMonacoEditor from "../../../input/InlineMonacoEditor";
import {useDebouncedCallback} from "use-debounce";
import BottomPanel from "../../../layout/utils/BottomPanel";

const SolutionQueriesManager = ({ questionId }) => {
    const ref = useRef()

    const {
        data: queries,
        mutate,
        error,
    } = useSWR(
        `/api/questions/${questionId}/database/queries`,
        questionId ? fetcher : null,
        { revalidateOnFocus: false }
    )

    const [ activeQuery, setActiveQuery ] = useState(null)

    const onAddQuery = useCallback(async () => {
        await fetch(`/api/questions/${questionId}/database/queries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        }).then(async (res) => {
            await mutate([...queries, await res.json()])
            ref.current.scrollTop = ref.current.scrollHeight
        });
    }, [queries, mutate])

    const onQueryUpdate = useCallback( async (query) => {
        await fetch(`/api/questions/${questionId}/database/queries/${query.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(query),
        }).then(async (res) => {
            await mutate(
                queries.map((q) =>
                    q.id === query.id
                        ? query
                        : q
                )
            )
        });
    }, [queries, mutate, questionId]);

    const debouncedOnQueryUpdate = useDebouncedCallback(onQueryUpdate, 500)

    return (
        <Loading loading={!queries} errors={[error]}>
            <Stack
                position={'relative'}
                height={'100%'}
                overflow={'hidden'}
                pb={'60px'}
            >
                <Button onClick={onAddQuery}>Add new query</Button>
                <ScrollContainer ref={ref}>
                    {queries?.map((query, index) => (
                        <QueryEditor
                            index={index}
                            active={index === activeQuery}
                            key={query.id}
                            query={query}
                            onChange={debouncedOnQueryUpdate}
                            onSelect={(i) => {
                                setActiveQuery(i)
                            }}
                        />
                    ))}
                </ScrollContainer>

                {
                    queries?.length > 0 && activeQuery !== null && queries[activeQuery] && (
                        <QueryUpdatePanel index={activeQuery} query={queries[activeQuery]} onChange={onQueryUpdate} />
                    )
                }
            </Stack>
        </Loading>
    )
}

const QueryUpdatePanel = ({ index, query, onChange }) => {
    return(
        <BottomPanel header={
            <Stack pl={1} direction={'column'} spacing={0} height={"60px"} alignItems={"flex-start"} justifyContent={"center"}>
                <Typography variant="body1">{`Query #${index + 1} - ${query.title || "Untitled"}`}</Typography>
                {query.description && (
                    <Typography variant="body2">{query.description}</Typography>
                )}
            </Stack>
        }>
            <Stack>
                <Typography variant="body1">Output</Typography>
                <Typography variant="body1">Settings</Typography>
                <Typography variant="body1">Template</Typography>
                <Typography variant="body1">Output</Typography>
                <Typography variant="body1">Settings</Typography>
                <Typography variant="body1">Template</Typography>
                <Typography variant="body1">Output</Typography>
                <Typography variant="body1">Settings</Typography>
                <Typography variant="body1">Template</Typography>
                <Typography variant="body1">Output</Typography>
                <Typography variant="body1">Settings</Typography>
                <Typography variant="body1">Template</Typography>
                <Typography variant="body1">Output</Typography>
                <Typography variant="body1">Settings</Typography>
                <Typography variant="body1">Template</Typography>
                <Typography variant="body1">Output</Typography>
                <Typography variant="body1">Settings</Typography>
                <Typography variant="body1">Template</Typography>
                <Typography variant="body1">Output</Typography>
                <Typography variant="body1">Settings</Typography>
                <Typography variant="body1">Template</Typography>
                <Typography variant="body1">Output</Typography>
                <Typography variant="body1">Settings</Typography>
                <Typography variant="body1">Template</Typography>
                <Typography variant="body1">Output</Typography>
                <Typography variant="body1">Settings</Typography>
                <Typography variant="body1">Template</Typography>
               
            </Stack>
        </BottomPanel>
    )

}

const QueryEditor = ({ index, active, query, onChange, onSelect, secondaryActions }) => {

    const theme = useTheme();

    const [ solution, setSolution ] = useState(query.solution)

    useEffect(() => {
        setSolution(query.solution)
    }, [query])

    const debouncedOnChange = useCallback(onChange, 500)

    return(
        <Stack position="relative" onClick={() => onSelect(index)} sx={{
            cursor: "pointer",
            borderLeft: `3px solid ${active ? theme.palette.primary.dark : "transparent"}`
        }}>
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
                    <Stack direction={'column'} spacing={1}>
                        <Typography variant="body1">{`#${index + 1} ${query.title || "Untitled"}`}</Typography>
                        {query.description && (
                            <Typography variant="body2">{query.description}</Typography>
                        )}
                    </Stack>
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
        </Stack>
    )
}

const QueryStudentPermission = ({ permission }) => {
    switch (permission) {
        case StudentPermission.UPDATE:
            return <Chip color={"primary"} label={"Editable"} />
        case StudentPermission.VIEW:
            return <Chip color={"secondary"} label={"Visible-only"} />
        case StudentPermission.HIDDEN:
            return <Chip color={"default"} label={"Hidden"} />
    }
}

export default SolutionQueriesManager
