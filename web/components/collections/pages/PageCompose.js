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
import QuestionTypeIcon from "../../question/QuestionTypeIcon";
import Image from "next/image";
import DragHandleSVG from "../../layout/utils/DragHandleSVG";
import ReorderableList from "../../layout/utils/ReorderableList";
import {useRouter} from "next/router";
import {useDebouncedCallback} from "use-debounce";

const CollectionListItem = ({ collectionToQuestion, index, onChange }) => {
    // display question icon, title, assign points and remove buttons
    return (
        <Paper variant={"outlined"}>
            <Stack direction="row" alignItems="center" spacing={1} pr={1}>
                <Stack justifyContent={"center"} sx={{ cursor: "move" }} pt={3} pb={3} pl={2} pr={1}>
                    <DragHandleSVG />
                </Stack>
                <QuestionTypeIcon type={collectionToQuestion.question.type} />
                <Stack direction={"row"} alignItems={"center"} spacing={1} flexGrow={1} overflow={"hidden"} whiteSpace={"nowrap"}>
                    <Typography variant="body1"><b>Q{index + 1}</b></Typography>
                    <Typography variant="body2">{collectionToQuestion.question.title}</Typography>
                </Stack>

                <Box minWidth={60} width={60}>
                    <TextField
                        label="Points"
                        type="number"
                        width={50}
                        size={"small"}
                        defaultValue={collectionToQuestion.points}
                        variant="standard"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        onChange={(ev) => {
                            onChange({
                                ...collectionToQuestion,
                                points: ev.target.value,
                            });
                        }}
                    />
                </Box>
                <IconButton key="delete-collection" onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    setCollectionToDelete(collection.id);
                    setDeleteDialogOpen(true);
                }}>
                    <Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />
                </IconButton>
            </Stack>
        </Paper>
    )
}


const PageCompose = () => {
    const router = useRouter();

    const { group } = useGroup();

    const [ queryString, setQueryString ] = useState(undefined);

    const { data:searchQuestions, mutate:mutateSearch } = useSWR(
        `/api/questions?${queryString ? (new URLSearchParams(queryString)).toString() : ''}`,
        group ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

    const { data:collection, mutate:mutateCollection } = useSWR(
        `/api/collections/${router.query.collectionId}/questions`,
        group && router.query.collectionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

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
            setCollectionToQuestions(collection.collectionToQuestions);
        }
    }, [collection]);


    const saveQuestionOrder = useCallback(async () => {
        // save question order
        // mutate collection
        console.log("saveQuestionOrder", "collectionToQuestions", collectionToQuestions);
        const response = await fetch(`/api/collections/${router.query.collectionId}/order`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                collectionToQuestions: collectionToQuestions
            })
        });

    }, [collectionToQuestions, router.query.collectionId]);

    const debounceSaveOrdering = useDebouncedCallback(saveQuestionOrder, 300);

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

    const saveCollectionToQuestion = useCallback(async (index, collectionToQuestion) => {
        // save collectionToQuestion
        // mutate collection
        const response = await fetch(`/api/collections/${router.query.collectionId}/questions`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                collectionToQuestion,
            })
        })

        if(response.ok){
            await mutateCollection();
        }

    }, [router.query.collectionId, mutateCollection]);

    const debouncheSaveCollectionToQuestion = useDebouncedCallback(saveCollectionToQuestion, 300);

    const onCollectionToQuestionChange = useCallback(async (index, collectionToQuestion) => {
        // update collectionToQuestion
           // mutate collection
        const newCollectionToQuestions = [...collectionToQuestions];
        newCollectionToQuestions[index] = collectionToQuestion;
        setCollectionToQuestions(newCollectionToQuestions);
        await debouncheSaveCollectionToQuestion(index, collectionToQuestion);
    }, [collectionToQuestions, setCollectionToQuestions, debouncheSaveCollectionToQuestion]);

    const addQuestionToCollection = useCallback(async (question) => {
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
                        <Stack spacing={2} padding={2} pr={0}>
                            <ReorderableList onChangeOrder={onChangeCollectionOrder}>
                                { collectionToQuestions && collectionToQuestions.map((collectionToQuestion, index) =>
                                    <CollectionListItem
                                        key={collectionToQuestion.question.id}
                                        index={index}
                                        collectionToQuestion={collectionToQuestion}
                                        onChange={(changedProperties) => onCollectionToQuestionChange(index, changedProperties)}
                                    />
                                )}
                            </ReorderableList>
                        </Stack>
                    }
                    rightPanel={
                        <Stack direction={"row"} height="100%">
                            <Box minWidth={"250px"}>
                                <QuestionSearch onSearch={setQueryString} />
                            </Box>
                            <Stack spacing={2} padding={2}>
                                <Stack alignItems="center" direction={"row"} justifyContent={"space-between"}>
                                    <Typography variant="h6">Questions</Typography>
                                </Stack>
                                <Stack spacing={4} overflow={"auto"} pl={1} pr={1}>
                                    {searchQuestions && searchQuestions.map((question) => (
                                        <QuestionListItem
                                            key={question.id}
                                            question={question}
                                            actions={[
                                                <Button key={"add"} startIcon={<AddIcon />} onClick={async () => await addQuestionToCollection(question)} >Add to collection</Button>
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


