import useSWR from "swr";
import {fetcher} from "../../../../code/utils";
import Loading from "../../../feedback/Loading";
import {
    Button,
    Stack,
    useTheme,
} from "@mui/material";
import React, {useCallback, useEffect, useRef, useState} from "react";
import ScrollContainer from "../../../layout/ScrollContainer";

import {useDebouncedCallback} from "use-debounce";

import QueryOutput from "./QueryOutput";
import QueryUpdatePanel from "./QueryUpdatePanel";
import QueryEditor from "./QueryEditor";


const SolutionQueriesManager = ({ questionId }) => {
    const theme = useTheme()

    const ref = useRef()

    const {
        data,
        mutate,
        error,
    } = useSWR(
        `/api/questions/${questionId}/database/queries`,
        questionId ? fetcher : null,
        { revalidateOnFocus: false }
    )


    const [ queries, setQueries ] = useState([])
    const [ outputs, setOutputs ] = useState([]);
    const [ activeQuery, setActiveQuery ] = useState(null)

    useEffect(() => {
        setQueries(data || []);
    }, [data]);

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

    const runAllQueries = useCallback(async () => {

        // erase eventual previous outputs
        setOutputs(queries.map(() => ({
            status: "RUNNING"
        })) || []);

        const results = await fetch(`/api/sandbox/${questionId}/database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        }).then((res) => res.json());

        // set all query outputs
        setOutputs(results || []);

    }, [questionId, outputs, queries]);

    const debouncedOnQueryUpdate = useDebouncedCallback(onQueryUpdate, 500)

    return (
        <Loading loading={!queries} errors={[error]}>
            <Stack
                position={'relative'}
                height={'100%'}
                overflow={'hidden'}
                pb={'60px'}
            >
                <Stack direction={"row"} spacing={1} alignItems={"center"} justifyContent={"space-between"} p={1}>
                    <Button variant={"outlined"} color={"info"} onClick={() => runAllQueries()}>
                        Run all
                    </Button>
                    <Button onClick={onAddQuery}>Add new query</Button>
                </Stack>
                <ScrollContainer ref={ref}>
                    {queries?.map((query, index) => (
                        <Stack position="relative" onClick={() => setActiveQuery(index)} sx={{
                            cursor: "pointer",
                            borderLeft: `3px solid ${index === activeQuery ? theme.palette.primary.dark : "transparent"}`
                        }}>
                            <QueryEditor
                                index={index}
                                active={index === activeQuery}
                                key={query.id}
                                query={query}
                                onChange={debouncedOnQueryUpdate}
                            />
                            <QueryOutput
                                output={outputs[index]}
                            />
                        </Stack>
                    ))}
                </ScrollContainer>
                {
                    queries?.length > 0 && activeQuery !== null && queries[activeQuery] && (
                        <QueryUpdatePanel
                            index={activeQuery}
                            query={queries[activeQuery]}
                            output={outputs[activeQuery]}
                            onChange={onQueryUpdate}
                        />
                    )
                }
            </Stack>
        </Loading>
    )
}




export default SolutionQueriesManager
