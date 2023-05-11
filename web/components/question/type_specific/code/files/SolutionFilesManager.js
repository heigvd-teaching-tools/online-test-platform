import useSWR from "swr";
import React, {useCallback, useRef} from "react";
import { create, del, update } from "./crud";
import {Box, Button, IconButton, Stack } from "@mui/material";
import FileEditor from "./FileEditor";
import Image from "next/image";

import languages from "../../../../../code/languages.json";
import CodeCheck from "../CodeCheck";
import Loading from "../../../../feedback/Loading";
import { fetcher } from "../../../../../code/utils";
import ScrollContainer from "../../../../layout/ScrollContainer";

const environments = languages.environments;
const SolutionFilesManager = ({ questionId, language }) => {
    const filesRef = useRef();

    const { data:codeToSolutionFiles, mutate, error } = useSWR(
        `/api/questions/${questionId}/code/files/solution`,
        questionId ? fetcher : null,
        { revalidateOnFocus: false }
    );

    const onAddFile = useCallback(async () => {
        const extension = environments.find(env => env.language === language).extension;
        const path = `/src/file${codeToSolutionFiles?.length || ""}.${extension}`;

        await create("solution", questionId, {
            file: {
                path,
                content: ""
            }
        }).then(async (newFile) => {
            await mutate([...codeToSolutionFiles, newFile]);
            // scroll to the bottom of the files list
            filesRef.current.scrollTop = filesRef.current.scrollHeight;
        });
    }, [questionId, codeToSolutionFiles, mutate, language]);

    const onFileUpdate = useCallback(async (file) => {
        await update("solution", questionId, file).then(async (updatedFile) => {
            await mutate(codeToSolutionFiles.map(codeToFile => codeToFile.file.id === updatedFile.id ? { ...codeToFile, file: updatedFile } : codeToFile));
        });
    }, [questionId, codeToSolutionFiles, mutate]);

    const onDeleteFile = useCallback(async (codeToSolutionFile) => {
        await del("solution", questionId, codeToSolutionFile)
            .then(async (msg) => {
                await mutate(codeToSolutionFiles.filter(file => file.id !== codeToSolutionFile.id));
            });
    }, [questionId, mutate, codeToSolutionFiles]);

    return (
        <Loading
            loading={!codeToSolutionFiles}
            errors={[error]}
        >{
            codeToSolutionFiles && (
                <Stack position={"relative"} height={"100%"} overflow={"hidden"} pb={"60px"}>
                    <Button onClick={onAddFile}>Add File</Button>
                    <ScrollContainer ref={filesRef}>
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
                    </ScrollContainer>
                    <Stack zIndex={2} position={"absolute"} bottom={0} left={0} maxHeight="100%" width="100%" overflow="auto">
                        <CodeCheck
                            codeCheckAction={() => fetch(`/api/sandbox/${questionId}/files`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ files: codeToSolutionFiles.map(file => file.file) })
                            })}
                        />
                    </Stack>
                </Stack>
            )}
        </Loading>
    )
}

export default SolutionFilesManager;
