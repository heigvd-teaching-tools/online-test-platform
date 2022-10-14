import LayoutMain from "../../layout/LayoutMain";
import { useRouter } from "next/router";
import useSWR from "swr";
import ExamSessionAnalytics from "../analytics/ExamSessionAnalytics";
import {Autocomplete, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import {Role} from "@prisma/client";
import Authorisation from "../../security/Authorisation";

const PageAnalytics = () => {
    const router = useRouter();

    const { data:examSessions } = useSWR(
        `/api/exam-sessions`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const { data:examSession } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const { data: questions } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}/questions/with-grading/official`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { refreshInterval  : 1000 }
    );

    const [ value, setValue ] = useState(null);
    const [ inputValue, setInputValue ] = useState('');

    useEffect(() => {
        if(examSession){
            setValue(examSession);
            setInputValue(examSession.label);
        }
    }, [examSession]);

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
        <LayoutMain>
            { examSession && examSessions && questions && (
                <>
                <Autocomplete
                    id="chose-exam-session"
                    options={examSessions}
                    getOptionLabel={(option) => option.label}
                    sx={{ width: '70%' }}
                    renderInput={(params) => <TextField {...params} label="Exam session" variant="outlined" />}
                    value={value}
                    onChange={async (event, newValue) => {
                        if(newValue && newValue.id){
                            await router.push(`/exam-sessions/${newValue.id}/analytics`);
                        }
                    }}
                    inputValue={inputValue}
                    onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                    }}

                />
                <ExamSessionAnalytics questions={questions} />
                </>
            )}
        </LayoutMain>
        </Authorisation>
    )
}

export default PageAnalytics;