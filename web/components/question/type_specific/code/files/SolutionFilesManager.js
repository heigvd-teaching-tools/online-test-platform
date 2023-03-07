import useSWR from "swr";
import React, {useCallback, useRef} from "react";
import { create, del, update } from "./crud";
import {Box, Button, IconButton, Stack} from "@mui/material";
import FileEditor from "./FileEditor";
import Image from "next/image";

import languages from "../languages.json";

const environments = languages.environments;
const SolutionFilesManager = ({ language, question }) => {
    const filesRef = useRef();

    const { data:codeToSolutionFiles, mutate } = useSWR(
        `/api/questions/${question.id}/code/files/solution`,
        question?.id ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus: false }
    );

    const onAddFile = useCallback(async () => {
        const extension = environments.find(env => env.language === language).extension;
        const path = `/src/file${codeToSolutionFiles?.length || ""}.${extension}`;

        await create("solution", question.id, {
            file: {
                path,
                content: ""
            }
        }).then(async (newFile) => {
            await mutate([...codeToSolutionFiles, newFile]);
            // scroll to the bottom of the files list
            filesRef.current.scrollTop = filesRef.current.scrollHeight;
        });
    }, [question.id, codeToSolutionFiles, mutate, language]);

    const onFileUpdate = useCallback(async (file) => {
        await update("solution", question.id, file).then(async () => await mutate());
    }, [question.id, mutate]);

    const onDeleteFile = useCallback(async (codeToSolutionFile) => {
        console.log("delete file", codeToSolutionFiles)
        await del("solution", question.id, codeToSolutionFile)
            .then(async (msg) => {
                await mutate(codeToSolutionFiles.filter(file => file.id !== codeToSolutionFile.id));
            });
    }, [question.id, mutate, codeToSolutionFiles]);

    return (
        <Stack height="100%">
            <Button onClick={onAddFile}>Add File</Button>
            {codeToSolutionFiles && (
                <Box ref={filesRef} height="100%" overflow="auto">
                    {codeToSolutionFiles.map((codeToSolutionFile, index) => (
                        <FileEditor
                            key={index}
                            file={codeToSolutionFile.file}
                            onChange={async (file) => await onFileUpdate({
                                ...codeToSolutionFile,
                                file
                            })}
                            secondaryActions={
                                <Stack direction="row" spacing={1}>
                                    <IconButton key="delete-file" onClick={async () => await onDeleteFile(codeToSolutionFile)}>
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
