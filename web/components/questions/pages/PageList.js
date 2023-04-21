import useSWR from 'swr';
import {useCallback, useEffect, useState} from "react";
import LayoutMain from '../../layout/LayoutMain';
import LayoutSplitScreen from '../../layout/LayoutSplitScreen';
import {Role} from "@prisma/client";
import Authorisation from "../../security/Authorisation";
import QuestionSearch from "../../question/QuestionSearch";
import MainMenu from "../../layout/MainMenu";
import {Box, Button, Stack, Typography} from "@mui/material";
import {useSnackbar} from "../../../context/SnackbarContext";
import {useRouter} from "next/router";
import AddQuestionDialog from "../list/AddQuestionDialog";
import QuestionListItem from "../list/QuestionListItem";
import {useGroup} from "../../../context/GroupContext";
import AlertFeedback from "../../feedback/AlertFeedback";
const PageList = () => {
    const router = useRouter();

    const { group } = useGroup();

    const { show: showSnackbar } = useSnackbar();

    const [ queryString, setQueryString ] = useState(undefined);

    const { data:questions, error, mutate } = useSWR(
        `/api/questions?${queryString ? (new URLSearchParams(queryString)).toString() : ''}`,
        group ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

    const [ addDialogOpen, setAddDialogOpen ] = useState(false);

    useEffect(() => {
        // if group changes, re-fetch questions
        if(group){
            (async () => await mutate())();
        }
    }, [group, mutate]);

    const createQuestion = useCallback(async (type, language) => {
        // language only used for code questions
        await fetch(`/api/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                type,
                language
            })
        })
            .then((res) => res.json())
            .then(async (createdQuestion) => {
                showSnackbar('Question created', "success");
                await mutate([...questions, createdQuestion]);
                await router.push(`/questions/${createdQuestion.id}`);
            }).catch(() => {
                showSnackbar('Error creating questions', 'error');
            });
    } , [router, showSnackbar, questions, mutate]);

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
            <LayoutMain header={
               <MainMenu />
            }>
                <LayoutSplitScreen
                    leftPanel={
                        <QuestionSearch onSearch={setQueryString} />
                    }
                    rightWidth={70}
                    rightPanel={
                        <Stack spacing={2} padding={2}>
                            <Stack alignItems="center" direction={"row"} justifyContent={"space-between"}>
                                <Typography variant="h6">Questions</Typography>
                                <Button onClick={() => setAddDialogOpen(true)}>Create a new question</Button>
                            </Stack>
                            {questions && questions.map((question) => (
                                <QuestionListItem
                                    key={question.id}
                                    question={question}
                                />
                            ))}
                            {questions && questions.length === 0 && (
                                <AlertFeedback severity="info">
                                    <Typography variant="body1">No questions found in this group. Try changing your search criteria</Typography>
                                </AlertFeedback>
                            )}
                        </Stack>
                    }
                />
                <AddQuestionDialog
                    open={addDialogOpen}
                    onClose={() => setAddDialogOpen(false)}
                    handleAddQuestion={async (type, language) => {
                        await createQuestion(type, language);
                        setAddDialogOpen(false);
                    }}
                />
            </LayoutMain>
        </Authorisation>
    );

};
export default PageList;


