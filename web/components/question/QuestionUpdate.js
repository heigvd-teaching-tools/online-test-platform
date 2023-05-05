import useSWR from "swr";
import { useCallback } from 'react';
import Image from 'next/image';
import {Stack, TextField, Button, Box, Autocomplete} from '@mui/material';
import ContentEditor from '../input/ContentEditor';

import LayoutSplitScreen from "../layout/LayoutSplitScreen";
import QuestionTypeSpecific from "./QuestionTypeSpecific";
import { useDebouncedCallback } from "use-debounce";

import LoadingAnimation from "../feedback/Loading";
import {useSnackbar} from "../../context/SnackbarContext";

import QuestionTagsSelector from "./tags/QuestionTagsSelector";
import {useRouter} from "next/router";
import Loading from "../feedback/Loading";

const QuestionUpdate = ({ questionId }) => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();

    const { data: question, mutate, error } = useSWR(
        `/api/questions/${questionId}`,
        questionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus: false }
    );

    const saveQuestion = useCallback(async (question) => {
        await fetch(`/api/questions/${question.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ question })
        })
            .then((res) => res.json())
            .then(async (updated) => {
                await mutate(updated);
                showSnackbar('Question saved', "success");
            }).catch(() => {
                showSnackbar('Error saving questions', 'error');
            });
    } , [showSnackbar, mutate, question]);

    const deleteQuestion = useCallback(async () => {
        await fetch(`/api/questions`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ question })
        })
            .then((res) => res.json())
            .then(async () => {
                await mutate();
                showSnackbar('Question deleted', "success");
                await router.push('/questions');
            }).catch(() => {
                showSnackbar('Error deleting question', 'error');
            });
    }, [question, showSnackbar, mutate]);

    const onChange = useCallback(async (changedProperties) => {
        // update the question in the cache
        const newQuestion = { ...question, ...changedProperties };
        await saveQuestion(newQuestion);
    }, [question]);

    const debounceChange = useDebouncedCallback(useCallback(async (changedProperties) => {
        await onChange(changedProperties);
    }, [onChange]), 500);

   return (
       <Loading
           loading={!question}
           errors={[error]}
       >
            <LayoutSplitScreen
                leftPanel={
                    question && (
                        <Stack spacing={2} sx={{ pl:2, pt:3, pb:2, height:'100%' }}>
                            <TextField
                                id={`question-${question.id}-title`}
                                label="Title"
                                variant="outlined"
                                fullWidth
                                focused
                                defaultValue={question.title}
                                onChange={(e) => debounceChange({
                                    title: e.target.value
                                })}
                            />

                            <Stack spacing={2} width={"100%"} height={"100%"} overflow={"auto"}>
                                <ContentEditor
                                    id={`question-${question.id}`}
                                    language="markdown"
                                    rawContent={question.content}
                                    onChange={(content) => debounceChange({
                                        content: content
                                    })}
                                />
                            </Stack>
                            <QuestionTagsSelector questionId={question.id} />
                            <Stack direction="row" justifyContent="flex-end" sx={{ width:'100%'}}>
                                <Button startIcon={<Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />} onClick={() => deleteQuestion(question.id)}>Delete this question</Button>
                            </Stack>
                        </Stack>
                    )
                }
                rightPanel={
                    question && (
                        <QuestionTypeSpecific
                            question={question}
                            onQuestionChange={onChange}
                        />
                    )
                }
            />
       </Loading>
    )
}

export default QuestionUpdate;
