import LayoutMain from '../../layout/LayoutMain';
import LayoutSplitScreen from '../../layout/LayoutSplitScreen';
import {Role} from "@prisma/client";
import Authorisation from "../../security/Authorisation";
import {Box, Button, IconButton, ListItem, Paper, Stack, TextField, Typography} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Link from "next/link";
import QuestionSearch from "../../question/QuestionSearch";
import {useCallback, useEffect, useState} from "react";
import useSWR from "swr";
import {useGroup} from "../../../context/GroupContext";
import QuestionListItem from "../../questions/list/QuestionListItem";
import AddIcon from '@mui/icons-material/Add';
import ReorderableList from "../../layout/utils/ReorderableList";
import {useRouter} from "next/router";
import {useDebouncedCallback} from "use-debounce";
import CollectionToQuestion from "../compose/CollectionToQuestion";


const PageCompose = () => {
    const router = useRouter();

    const { group } = useGroup();

    const [ queryString, setQueryString ] = useState(undefined);

    const { data:searchQuestions, mutate:mutateSearch } = useSWR(
        `/api/questions?${queryString ? (new URLSearchParams(queryString)).toString() : ''}`,
        group ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

    const { data:collection, mutate:mutateCollection } = useSWR(
        `/api/collections/${router.query.collectionId}`,
        group && router.query.collectionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

    const [ label, setLabel ] = useState('');
    const [ collectionToQuestions, setCollectionToQuestions ] = useState([]);

    useEffect(() => {
        // if group changes, re-fetch questions
        if(group){
            (async () => await mutateCollection())();
            (async () => await mutateSearch())();
        }
    }, [group, mutateSearch, mutateCollection]);

    useEffect(() => {
        if(collection){
            setLabel(collection.label);
            setCollectionToQuestions(collection.collectionToQuestions);
        }
    }, [collection]);

    const addCollectionToQuestion = useCallback(async (question) => {
        // add question to collection
        // mutate collection
        const response = await fetch(`/api/collections/${router.query.collectionId}/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                questionId: question.id,
                collectionId: router.query.collectionId,
            })
        })
        if(response.ok){
            await mutateCollection();
        }

    }, [router.query.collectionId, mutateCollection]);

    const saveQuestionOrder = useCallback(async () => {
        // save question order
        const response = await fetch(`/api/collections/${router.query.collectionId}/order`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                collectionToQuestions: collectionToQuestions
            })
        });
        if(response.ok){
            await mutateCollection();
        }
    }, [collectionToQuestions, router.query.collectionId, mutateCollection]);

    const saveCollection = useCallback(async (updated) => {
        // save collection
        const response = await fetch(`/api/collections/${router.query.collectionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                collection: updated
            })
        });
        if(response.ok){
            await mutateCollection(updated);
        }
    }, [router.query.collectionId, mutateCollection]);

    const debounceSaveOrdering = useDebouncedCallback(saveQuestionOrder, 300);
    const debounceSaveCollection = useDebouncedCallback(saveCollection, 300);

    const onChangeCollectionOrder = useCallback(async (sourceIndex, targetIndex) => {
        const reordered = [...collectionToQuestions];
        const moved = reordered[sourceIndex];
        moved.order = targetIndex;
        reordered[targetIndex].order = sourceIndex;
        reordered[sourceIndex] = reordered[targetIndex];
        reordered[targetIndex] = moved;
        setCollectionToQuestions(reordered);
        await debounceSaveOrdering();
    }, [collectionToQuestions, setCollectionToQuestions, debounceSaveOrdering]);

    const onCollectionToQuestionChange = useCallback(async (index, collectionToQuestion) => {
        const updated = [...collectionToQuestions];
        updated[index] = collectionToQuestion;
        await mutateCollection(updated);
    }, [collectionToQuestions, setCollectionToQuestions]);

    const onDeleteCollectionToQuestion = useCallback(async (index) => {
        const updated = [...collectionToQuestions];
        updated.splice(index, 1);
        await mutateCollection(updated);
    }, [collectionToQuestions, setCollectionToQuestions]);

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
            <LayoutMain header={
                <Box>
                    <Link href="/collections">
                        <Button startIcon={<ArrowBackIosIcon /> }>
                            Back
                        </Button>
                    </Link>
                </Box>
            }>
                <LayoutSplitScreen
                    leftPanel={
                        collection &&
                            <Stack spacing={2} padding={2} pt={3} pr={0}>
                                <TextField
                                    label="Collection Label"
                                    variant="outlined"
                                    fullWidth
                                    value={label}
                                    onChange={async (ev) => {
                                        setLabel(ev.target.value);
                                        const updated = { ...collection };
                                        updated.label = ev.target.value;
                                        await debounceSaveCollection(updated);
                                    }}
                                />
                                <ReorderableList onChangeOrder={onChangeCollectionOrder}>
                                    { collectionToQuestions && collectionToQuestions.map((collectionToQuestion, index) =>
                                        <CollectionToQuestion
                                            key={collectionToQuestion.question.id}
                                            index={index}
                                            collectionToQuestion={collectionToQuestion}
                                            onChange={(index, updates) => onCollectionToQuestionChange(index, updates)}
                                            onDelete={(index) => onDeleteCollectionToQuestion(index)}
                                        />
                                    )}
                                </ReorderableList>
                            </Stack>
                    }
                    rightPanel={
                        collectionToQuestions && searchQuestions &&
                        <Stack direction={"row"} height="100%">
                            <Box minWidth={"250px"}>
                                <QuestionSearch onSearch={setQueryString} />
                            </Box>
                            <Stack spacing={2} padding={2} width={"100%"}>
                                <Stack alignItems="center" direction={"row"} justifyContent={"space-between"}>
                                    <Typography variant="h6">Questions</Typography>
                                </Stack>
                                <Stack spacing={4} overflow={"auto"} pl={1} pr={1}>
                                    { searchQuestions
                                        .filter((question) => !collectionToQuestions.find((collectionToQuestion) => collectionToQuestion.question.id === question.id))
                                        .map((question) => (
                                            <QuestionListItem
                                                key={question.id}
                                                question={question}
                                                actions={[
                                                    <Button key={"add"} startIcon={<AddIcon />} onClick={async () => await addCollectionToQuestion(question)} >Add to collection</Button>
                                                ]}
                                            />
                                    ))}
                                </Stack>
                            </Stack>
                        </Stack>
                    }
                />
            </LayoutMain>
        </Authorisation>
    );

};
export default PageCompose;


