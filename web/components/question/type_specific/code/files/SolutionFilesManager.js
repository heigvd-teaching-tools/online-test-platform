import useSWR from "swr";
import React, {useCallback, useRef} from "react";
import { create, del, update } from "./crud";
import {Box, Button, IconButton, Paper, Stack} from "@mui/material";
import FileEditor from "./FileEditor";
import Image from "next/image";

import languages from "../languages.json";
import CodeCheck from "../CodeCheck";

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
        await update("solution", question.id, file).then(async (updatedFile) => {
            await mutate(codeToSolutionFiles.map(codeToFile => codeToFile.file.id === updatedFile.id ? { ...codeToFile, file: updatedFile } : codeToFile));
        });
    }, [question.id, codeToSolutionFiles, mutate]);

    const onDeleteFile = useCallback(async (codeToSolutionFile) => {
        console.log("delete file", codeToSolutionFiles)
        await del("solution", question.id, codeToSolutionFile)
            .then(async (msg) => {
                await mutate(codeToSolutionFiles.filter(file => file.id !== codeToSolutionFile.id));
            });
    }, [question.id, mutate, codeToSolutionFiles]);

    return (
        codeToSolutionFiles && (
            <Stack height="100%" position="relative">
                <Button onClick={onAddFile}>Add File</Button>
                <Box ref={filesRef} height="100%" overflow="auto" pb={16}>
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

                <Stack zIndex={2} position="absolute" maxHeight="100%" width="100%" overflow="auto" bottom={0} left={0}>
                    {codeToSolutionFiles?.length > 0 && (
                        <CodeCheck
                            fetchSandbox={() => fetch(`/api/sandbox/${question.id}/files`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ files: codeToSolutionFiles.map(file => file.file) })
                                })
                            }
                        />
                    )}
                </Stack>
            </Stack>
        )
    )
}

export default SolutionFilesManager;
