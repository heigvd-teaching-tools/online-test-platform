import useSWR from 'swr';
import {useCallback, useState} from "react";
import LayoutMain from '../../layout/LayoutMain';
import LayoutSplitScreen from '../../layout/LayoutSplitScreen';
import {Role} from "@prisma/client";
import Authorisation from "../../security/Authorisation";
import QuestionSearch from "../../question/QuestionSearch";
import MainMenu from "../../layout/MainMenu";
import {Button, Card, Stack, Typography} from "@mui/material";
import {useSnackbar} from "../../../context/SnackbarContext";
import {useRouter} from "next/router";
import {useSession} from "next-auth/react";
import AddCollectionDialog from "../../collections/AddCollectionDialog";
import AddQuestionDialog from "../../question/AddQuestionDialog";

const QuestionListItem = ({ question: { id, title, content, type } }) => {
    return (
        <Card>
            <Stack spacing={2} p={2}>
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="h6">{type}</Typography>
                </Stack>
                <Typography variant="body1">{content}</Typography>
            </Stack>
        </Card>
    );
}

const PageList = () => {
    const router = useRouter();

    const { show: showSnackbar } = useSnackbar();

    const [ queryString, setQueryString ] = useState({});

    const { data:questions, error, mutate } = useSWR(
        `/api/questions/search?${(new URLSearchParams(queryString)).toString()}`,
        queryString ? (...args) => fetch(...args).then((res) => res.json()) : null
    );
    const [ addDialogOpen, setAddDialogOpen ] = useState(false);

    const createQuestion = useCallback(async (type) => {
        await fetch(`/api/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                type
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
                        <QuestionSearch
                            onSearch={setQueryString}
                        />
                    }
                    rightWidth={70}
                    rightPanel={
                    <Stack spacing={2}>
                        <Stack alignItems="flex-end" p={1}>
                            <Button onClick={() => setAddDialogOpen(true)}>Create a new question</Button>
                        </Stack>
                        {questions && questions.map((question) => (
                            <QuestionListItem
                                key={question.id}
                                question={question}
                            />
                        ))}
                    </Stack>
                    }
                />
                <AddQuestionDialog
                    open={addDialogOpen}
                    onClose={() => setAddDialogOpen(false)}
                    handleAddQuestion={async (type) => {
                        await createQuestion(type);
                        setAddDialogOpen(false);
                    }}
                />
            </LayoutMain>
        </Authorisation>
    );

};
export default PageList;


