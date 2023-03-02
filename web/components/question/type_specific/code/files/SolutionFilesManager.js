import useSWR from "swr";
import React, {useCallback} from "react";
import {addFile, deleteFile, updateFile} from "./crud";
import {Box, Button, IconButton, Stack} from "@mui/material";
import FileEditor from "./FileEditor";
import Image from "next/image";

import languages from "../languages.json";

const environments = languages.environments;
const SolutionFilesManager = ({ language, question }) => {

    const { data:files, mutate, error } = useSWR(
        `/api/questions/${question.id}/code/files/solution`,
        question?.id ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus: false }
    );

    const onAddFile = useCallback(async () => {
        const extension = environments.find(env => env.language === language).extension;
        const path = `/src/file${files?.length || ""}.${extension}`;

        await addFile("solution", question.id, {
            path,
            content: ""
        })
            .then(async (newFiles) => {
                console.log("new file", newFiles)
                await mutate(newFiles);

            });
    }, [question.id, files, mutate, language]);

    const onFileUpdate = useCallback(async (file) => {
        console.log("update file", file)
        await updateFile("solution", question.id, file)
            .then(async () => {

                await mutate();
            });
    }, [question.id, mutate, files]);

    const onDeleteFile = useCallback(async (file) => {
        console.log("delete file", file)
        await deleteFile("solution", question.id, file)
            .then(async (data) => {
                let newFiles = files;
                newFiles = newFiles.filter(f => f.id !== data.id);
                await mutate(newFiles);
            });
    }, [question.id, mutate, files]);

    return (
        <Stack height="100%">
            <Button onClick={onAddFile}>Add File</Button>
            {files && (
                <Box height="100%" overflow="auto">
                    {files.map((file, index) => (
                        <FileEditor
                            key={index}
                            file={file}
                            onChange={async (file) => await onFileUpdate(file)}
                            secondaryActions={
                                <Stack direction="row" spacing={1}>
                                    <IconButton key="delete-file" onClick={async () => await onDeleteFile(file)}>
                                        <Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />
                                    </IconButton>
                                </Stack>
                            }
                        />
                    ))}
                </Box>
            )}
        </Stack>
    )
}

export default SolutionFilesManager;
