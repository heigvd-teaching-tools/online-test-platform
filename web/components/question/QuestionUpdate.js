import useSWR from "swr";
import { useCallback } from 'react';
import Image from 'next/image';
import {Stack, TextField, Button, Box, Autocomplete} from '@mui/material';
import ContentEditor from '../input/ContentEditor';

import LayoutSplitScreen from "../layout/LayoutSplitScreen";
import QuestionTypeSpecific from "./QuestionTypeSpecific";
import { useDebouncedCallback } from "use-debounce";

import LoadingAnimation from "../feedback/LoadingAnimation";
import {useSnackbar} from "../../context/SnackbarContext";

import { createFilterOptions } from '@mui/material/Autocomplete';

const filterOptions = createFilterOptions({
    matchFrom: 'start',
    ignoreCase: true,
    ignoreAccents: true,
    limit: 20, // suggestions limit
    stringify: (option) => option.title,
});

const tags = [
    { title: 'JavaScript', id: 1 },
    { title: 'React', id: 2 },
    { title: 'Node', id: 3 },
    { title: 'Next', id: 4 },
    { title: 'GraphQL', id: 5 },
    { title: 'TypeScript', id: 6 },
    { title: 'CSS', id: 7 },
    { title: 'HTML', id: 8 },
    { title: 'SQL', id: 9 },
    { title: 'MongoDB', id: 10 },
    { title: 'MySQL', id: 11 },
    { title: 'PostgreSQL', id: 12 },
    { title: 'Java', id: 13 },
    { title: 'Python', id: 14 },
    { title: 'C#', id: 15 },
    { title: 'C++', id: 16 },
    { title: 'C', id: 17 },
    { title: 'PHP', id: 18 },
    { title: 'Ruby', id: 19 },
    { title: 'Go', id: 20 },
    { title: 'Rust', id: 21 },
    { title: 'Swift', id: 22 },
    { title: 'Kotlin', id: 23 },
    { title: 'Scala', id: 24 },
    { title: 'Dart', id: 25 },
    { title: 'Elixir', id: 26 },
    { title: 'Clojure', id: 27 },
    { title: 'Haskell', id: 28 },
    { title: 'Perl', id: 29 },
    { title: 'R', id: 30 },
    { title: 'Lua', id: 31 },
    { title: 'Erlang', id: 32 },
    { title: 'F#', id: 33 },
    { title: 'Groovy', id: 34 },



];

const QuestionUpdate = ({ questionId, onQuestionDeleted, onQuestionChanged }) => {
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
            .then((updated) => {
                onQuestionChanged && onQuestionChanged(updated);
                showSnackbar('Question saved', "success");
            }).catch(() => {
                showSnackbar('Error saving questions', 'error');
            });
    } , [showSnackbar, mutate, question]);

    const onChange = useCallback(async (changedProperties) => {
        // update the question in the cache
        const newQuestion = { ...question, ...changedProperties };
        await saveQuestion(newQuestion);
    }, [question, onQuestionChanged]);

    const debounceChange = useDebouncedCallback(useCallback(async (changedProperties) => {
        await onChange(changedProperties);
    }, [onChange]), 500);



    if (error) return <div>failed to load</div>
    if (!question) return <LoadingAnimation />

    return (
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
                            <Autocomplete
                                multiple
                                id="tags-outlined"
                                options={tags}
                                getOptionLabel={(option) => option.title}
                                defaultValue={[tags[3]]}
                                filterSelectedOptions
                                filterOptions={filterOptions}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="tags"
                                    />
                                )}
                            />
                        </Stack>

                        <Stack direction="row" justifyContent="flex-end" sx={{ width:'100%'}}>
                            <Button startIcon={<Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />} onClick={() => onQuestionDelete(question.id)}>Delete this question</Button>
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
    )
}

export default QuestionUpdate;
