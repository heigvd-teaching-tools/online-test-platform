import useSWR from 'swr';
import {useCallback, useEffect, useState} from "react";
import LayoutMain from '../../layout/LayoutMain';
import LayoutSplitScreen from '../../layout/LayoutSplitScreen';
import {Role} from "@prisma/client";
import Authorisation from "../../security/Authorisation";
import QuestionFilter from "../../question/QuestionFilter";
import MainMenu from "../../layout/MainMenu";
import { Button, Stack, Typography} from "@mui/material";
import {useSnackbar} from "../../../context/SnackbarContext";
import {useRouter} from "next/router";
import AddQuestionDialog from "../list/AddQuestionDialog";
import QuestionListItem from "../list/QuestionListItem";
import {useGroup} from "../../../context/GroupContext";
import AlertFeedback from "../../feedback/AlertFeedback";
import Loading from "../../feedback/Loading";
import {fetcher} from "../../../code/utils";
import ScrollContainer from "../../layout/ScrollContainer";

const PageList = () => {
    const router = useRouter();

    const { group } = useGroup();

    const { show: showSnackbar } = useSnackbar();

    const [ queryString, setQueryString ] = useState(undefined);

    const { data:questions, error, mutate } = useSWR(
        `/api/questions${queryString ? `?${(new URLSearchParams(queryString)).toString()}` : ''}`,
        group ? fetcher : null,
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
            <Loading
                loading={!questions}
                errors={[error]}
                >
                <LayoutMain header={
                   <MainMenu />
                }>
                    <LayoutSplitScreen
                        leftPanel={
                            <QuestionFilter onApplyFilter={setQueryString} />
                        }
                        rightWidth={70}
                        rightPanel={
                            questions &&
                                <Stack spacing={2} padding={2} height={"100%"}>
                                    <Stack alignItems="center" direction={"row"} justifyContent={"space-between"}>
                                        <Typography variant="h6">{questions.length} questions</Typography>
                                        <Button onClick={() => setAddDialogOpen(true)}>Create a new question</Button>
                                    </Stack>
                                    <ScrollContainer spacing={4} padding={1}>
                                        {questions && questions.map((question) => (
                                            <QuestionListItem
                                                key={question.id}
                                                question={question}
                                                actions={[
                                                    <Button key={`action-update-${question.id}`} onClick={async () => {
                                                        await router.push(`/questions/${question.id}`);
                                                    }} variant={"text"}>Update</Button>
                                                ]}
                                            />
                                        ))}
                                    </ScrollContainer>
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
            </Loading>
        </Authorisation>
    );

};
export default PageList;


