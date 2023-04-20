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
import AddQuestionDialog from "../../question/AddQuestionDialog";
import QuestionTypeIcon from "../../question/QuestionTypeIcon";
import Link from "next/link";
import ContentEditor from "../../input/ContentEditor";
import {useSession} from "next-auth/react";

const markdownToText = (markdown) => {
    // Replace markdown headings with an empty string
    markdown = markdown.replace(/^#+\s/gm, '');

    // Replace markdown links with the link text
    markdown = markdown.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Replace other markdown formatting with an empty string
    markdown = markdown.replace(/([*_~`])/g, '');

    // Remove leading and trailing whitespace
    markdown = markdown.trim();

    return markdown;
}

const truncateString = (str, n) => {
    if (str.length <= n) {
        return str
    }
    return str.slice(0, n) + '\n\n...'
}

const QuestionListItem = ({ question: { id, title, content, type } }) => {
    return (
        <Link href={`/questions/${id}`}>
            <Card sx={{ cursor: 'pointer' }}>
                <Stack spacing={2} p={2}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6">{title}</Typography>
                        <QuestionTypeIcon type={type} size={32} />
                    </Stack>
                    <ContentEditor
                        id={'questions-content-' + id}
                        readOnly
                        rawContent={truncateString(markdownToText(content), 100)}
                    />
                </Stack>
            </Card>
        </Link>
    );
}

const PageList = () => {
    const router = useRouter();

    const { data: session } = useSession();

    const { show: showSnackbar } = useSnackbar();

    const [ queryString, setQueryString ] = useState(undefined);

    const { data:questions, error, mutate } = useSWR(
        queryString ? `/api/questions/search?${(new URLSearchParams(queryString)).toString()}` : 'api/questions',
        (...args) => fetch(...args).then((res) => res.json())
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
                    <Stack spacing={2} padding={2}>
                        <Stack alignItems="center" p={1} direction={"row"} justifyContent={"space-between"}>
                            <Typography variant="h6">{session.user.selected_group.label} questions</Typography>
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


