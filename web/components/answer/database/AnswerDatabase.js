import useSWR from "swr";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDebouncedCallback} from "use-debounce";
import {Button, Stack} from "@mui/material";
import {LoadingButton} from "@mui/lab";

import {fetcher} from "@/code/utils";
import Loading from "@/components/feedback/Loading";
import BottomCollapsiblePanel from "@/components/layout/utils/BottomCollapsiblePanel";
import ScrollContainer from "@/components/layout/ScrollContainer";

import QueriesRunSummary from "./QueriesRunSummary";
import StudentQueryEditor from "./StudentQueryEditor";
import StudentOutputDisplay from "./StudentOutputDisplay";
import StudentQueryConsole from "./StudentQueryConsole";

const AnswerDatabase = ({ jamSessionId, questionId, onAnswerChange }) => {
    const { data:answer, error } = useSWR(
        `/api/users/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
        questionId ? fetcher : null,
        { revalidateOnFocus: false }
    )

    const ref = useRef()

    const [ saveLock, setSaveLock ] = useState(false)
    const [ saving, setSaving ] = useState(false)
    const [ openConsole, setOpenConsole ] = useState(false)
    const [ queries, setQueries ] = useState()
    const [ studentOutputs, setStudentOutputs ] = useState()

    useEffect(() => {
        const studentQueries = answer?.database?.queries;
        if (studentQueries) {
            setQueries(studentQueries.map((q) => q.query))
            setStudentOutputs(studentQueries.map((q) => q.studentOutput))
        }
    }, [questionId, answer]);

    const solutionOutputs = useMemo(() => answer?.question.database.solutionQueries.map((solQ) => ({
        order: solQ.query.order,
        output: solQ.output?.output
    })), [answer]);

    const getSolutionOutput = useCallback((order) => solutionOutputs.find(q => q.order === order), [solutionOutputs])

    const saveAndTest = useCallback(async () => {
        setSaving(true);
        setStudentOutputs(queries.map((q, index) => ({
            ...studentOutputs[index],
            output:{
                ...studentOutputs[index]?.output,
                result: null,
                status: "RUNNING",
                testPassed: null,
            }
        })) || []);

        // remove any lintResult from queries
        setQueries(queries.map((q) => ({
            ...q,
            lintResult: null,
        })) || []);

        const studentAnswerQueries = await fetch(`/api/sandbox/jam-sessions/${jamSessionId}/questions/${questionId}/student/database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(res => res.json());
        setStudentOutputs(studentAnswerQueries.map((q) => q.studentOutput));
        setQueries(queries.map((q, index) => ({
            ...q,
            lintResult: studentAnswerQueries[index].query.lintResult,
        })) || []);
        setSaving(false);
    }, [jamSessionId, questionId, queries, studentOutputs]);

    const onQueryChange = useCallback(
        async (query) => {
            const updatedStudentAnswer = await fetch(
                `/api/users/jam-sessions/${jamSessionId}/questions/${questionId}/answers/database/${query.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: query.content }),
                }
            ).then((res) => res.json());
            setSaveLock(false);
            onAnswerChange && onAnswerChange(updatedStudentAnswer)
        },
        [jamSessionId, questionId, onAnswerChange]
    )

    const debouncedOnChange = useDebouncedCallback(onQueryChange, 500)
    const handleChange = (query) => {
        setSaveLock(true);
        debouncedOnChange(query);
    }


    return (
        <Loading errors={[error]} loading={!answer}>
            {queries && queries.length > 0 && (
                <>
                    <BottomCollapsiblePanel
                        bottomPanel={
                            <Stack direction="row" spacing={1} p={1}>
                                <LoadingButton
                                    loading={saving}
                                    disabled={saveLock}
                                    variant={"contained"}
                                    onClick={() => saveAndTest()}
                                >
                                    Save and test
                                </LoadingButton>

                                <Button
                                    variant={"outlined"}
                                    onClick={() => setOpenConsole(true)}
                                >
                                    Console
                                </Button>
                            </Stack>
                        }
                        >
                        <Stack pt={1}>
                            <QueriesRunSummary
                                queries={queries}
                                studentOutputs={studentOutputs}
                            />
                        </Stack>
                        <ScrollContainer ref={ref} pb={24}>
                            {queries?.map((query, index) => (
                                <Stack key={query.id}>
                                    <StudentQueryEditor
                                        query={query}
                                        onChange={(query) => handleChange(query)}
                                    />

                                    <StudentOutputDisplay
                                        order={query.order}
                                        testQuery={query.testQuery}
                                        queryOutputTests={query.queryOutputTests}
                                        lintResult={query.lintResult}
                                        studentOutput={studentOutputs[index]}
                                        solutionOutput={getSolutionOutput(query.order)}
                                    />
                                </Stack>
                            ))}
                        </ScrollContainer>

                    </BottomCollapsiblePanel>
                    <StudentQueryConsole
                        jamSessionId={jamSessionId}
                        questionId={questionId}
                        open={openConsole}
                        studentQueries={queries}
                        onClose={() => setOpenConsole(false)}
                    />
                </>
            )}

        </Loading>
    )
}




export default AnswerDatabase;
