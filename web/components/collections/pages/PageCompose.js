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

const CollectionListItem = ({ question, index }) => {
    // display question icon, title, assign points and remove buttons
    return (
        <Paper variant={"outlined"}>
            <Stack direction="row" alignItems="center" spacing={1} pr={1}>
                <Stack justifyContent={"center"} sx={{ cursor: "move" }} pt={3} pb={3} pl={2} pr={1}>
                    <DragHandleSVG />
                </Stack>
                <QuestionTypeIcon type={question.type} />
                <Stack direction={"row"} alignItems={"center"} spacing={1} flexGrow={1} overflow={"hidden"} whiteSpace={"nowrap"}>
                    <Typography variant="body1"><b>Q{index + 1}</b></Typography>
                    <Typography variant="body2">{question.title}</Typography>
                </Stack>

                <Box minWidth={60} width={60}>
                    <TextField
                        label="Points"
                        type="number"
                        width={50}
                        size={"small"}
                        defaultValue={4}
                        variant="standard"
                        InputLabelProps={{
                            shrink: true,
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

    const { group } = useGroup();

    const [ queryString, setQueryString ] = useState(undefined);

    const { data:searchQuestions, error, mutate } = useSWR(
        `/api/questions?${queryString ? (new URLSearchParams(queryString)).toString() : ''}`,
        group ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

    const [ collection, setCollection ] = useState(searchQuestions);

    useEffect(() => {
        // if group changes, re-fetch questions
        if(group){
            (async () => await mutate())();
        }
    }, [group, mutate]);

    useEffect(() => {
        if(searchQuestions){
            setCollection(searchQuestions);
        }
    }, [searchQuestions]);

    const onChangeCollectionOrder = useCallback((sourceIndex, targetIndex) => {
        const reordered = [...collection];
        const moved = reordered[sourceIndex];
        reordered[sourceIndex] = reordered[targetIndex];
        reordered[targetIndex] = moved;
        setCollection(reordered);
    }, [collection]);

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
                        <Stack
                            spacing={2}
                            padding={2}
                            pr={0}
                        >
                            <ReorderableList onChangeOrder={onChangeCollectionOrder}>
                                { collection && collection.map((question, index) =>
                                    <CollectionListItem
                                        key={question.id}
                                        index={index}
                                        question={question}
                                    />
                                )}
                            </ReorderableList>
                        </Stack>
                    }
                    rightPanel={
                        <Stack direction={"row"}>
                            <Box minWidth={"250px"}>
                                <QuestionSearch onSearch={setQueryString} />
                            </Box>
                            <Stack spacing={2} padding={2}>
                                <Stack alignItems="center" direction={"row"} justifyContent={"space-between"}>
                                    <Typography variant="h6">Questions</Typography>
                                </Stack>
                                <Stack spacing={4}>
                                    {searchQuestions && searchQuestions.map((question) => (

                                        <QuestionListItem
                                            key={question.id}
                                            question={question}
                                            actions={[
                                                <Button
                                                    key={"add"}
                                                    startIcon={<AddIcon />}
                                                >Add to collection
                                                </Button>
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


