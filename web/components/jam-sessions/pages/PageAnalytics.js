import LayoutMain from "../../layout/LayoutMain";
import { useRouter } from "next/router";
import useSWR from "swr";
import JamSessionAnalytics from "../analytics/JamSessionAnalytics";
import {Autocomplete, Stack, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import {Role} from "@prisma/client";
import Authorisation from "../../security/Authorisation";
import MainMenu from "../../layout/MainMenu";
import {fetcher} from "../../../code/utils";
import Loading from "../../feedback/Loading";

const PageAnalytics = () => {
    const router = useRouter();
    const { jamSessionId } = router.query;

    const { data:jamSessions, error: errorJamSessions } = useSWR(
        `/api/jam-sessions`,
        jamSessionId ? fetcher : null
    );

    const { data:jamSession, error: errorJamSession } = useSWR(
        `/api/jam-sessions/${jamSessionId}`,
        jamSessionId ? fetcher : null
    );

    const { data: JamSessionToQuestions, error: errorQuestions } = useSWR(
        `/api/jam-sessions/${jamSessionId}/questions?withGradings=true`,
        jamSessionId ? fetcher : null,
        { refreshInterval  : 1000 }
    );

    const [ value, setValue ] = useState(null);
    const [ inputValue, setInputValue ] = useState('');

    useEffect(() => {
        if(jamSession){
            setValue(jamSession);
            setInputValue(jamSession.label);
        }
    }, [jamSession]);

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
            <Loading
                error={[errorJamSessions, errorJamSession, errorQuestions]}
                loading={!jamSession || !jamSessions || !JamSessionToQuestions}
            >
                <LayoutMain
                    header={ <MainMenu /> }
                    padding={2}
                    spacing={2}
                >
                    { jamSession && jamSessions && JamSessionToQuestions && (
                        <Stack alignItems="center" spacing={2} padding={2}>
                            <Autocomplete
                                id="chose-jam-session"
                                options={jamSessions}
                                getOptionLabel={(option) => option.label}
                                sx={{ width: '70%' }}
                                renderInput={(params) => <TextField {...params} label="Jam session" variant="outlined" />}
                                value={value}
                                onChange={async (event, newValue) => {
                                    if(newValue && newValue.id){
                                        await router.push(`/jam-sessions/${newValue.id}/analytics`);
                                    }
                                }}
                                inputValue={inputValue}
                                onInputChange={(event, newInputValue) => {
                                    setInputValue(newInputValue);
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value.id}

                            />
                            <JamSessionAnalytics JamSessionToQuestions={JamSessionToQuestions} />
                        </Stack>
                    )}
                </LayoutMain>
            </Loading>
        </Authorisation>
    )
}

export default PageAnalytics;
