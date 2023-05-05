import useSWR from "swr";
import {Box, Button, MenuItem, Stack} from "@mui/material";
import FileEditor from "./FileEditor";
import { update, pull } from "./crud";
import DropDown from "../../../../input/DropDown";
import {StudentFilePermission} from "@prisma/client";
import React, {useCallback} from "react";
import CodeCheck from "../CodeCheck";
import Loading from "../../../../feedback/Loading";

const TemplateFilesManager = ({ questionId }) => {

    const { data: codeToTemplateFiles, mutate, error } = useSWR(
        `/api/questions/${questionId}/code/files/template`,
        questionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus: false }
    );

    const onFileUpdate = useCallback(async (codeToTemplateFile) => {
        await update("template", questionId, codeToTemplateFile).then(async (updatedFile) => {
            await mutate(codeToTemplateFiles.map(codeToFile => codeToFile.file.id === updatedFile.id ? { ...codeToFile, file: updatedFile } : codeToFile));
        });
    }, [questionId, codeToTemplateFiles, mutate]);


    const onPullSolution = useCallback(async () => {
        await pull(questionId).then(async (data) => await mutate(data));
    }, [questionId, mutate]);

    return (
        <Loading
            loading={!codeToTemplateFiles}
            errors={[error]}
        >{
            codeToTemplateFiles && (
            <Stack height="100%" position="relative">
                <Button onClick={onPullSolution}>Pull Solution Files</Button>
                    <Box height="100%" overflow="auto">
                        {codeToTemplateFiles.map((codeToTemplateFile, index) => (
                            <FileEditor
                                key={index}
                                file={codeToTemplateFile.file}
                                readonlyPath
                                onChange={async (file) => await onFileUpdate({
                                    ...codeToTemplateFile,
                                    file
                                })}
                                secondaryActions={
                                    <Stack direction="row" spacing={1}>
                                        <DropDown
                                            id={`${codeToTemplateFile.file.id}-student-permission`}
                                            name="Student Permission"
                                            defaultValue={codeToTemplateFile.studentPermission}
                                            minWidth="200px"
                                            onChange={async (permission) => {
                                                codeToTemplateFile.studentPermission = permission;
                                                await onFileUpdate(codeToTemplateFile);
                                            }}
                                        >
                                            <MenuItem value={StudentFilePermission.UPDATE}>Update</MenuItem>
                                            <MenuItem value={StudentFilePermission.VIEW}>View</MenuItem>
                                            <MenuItem value={StudentFilePermission.HIDDEN}>Hidden</MenuItem>
                                        </DropDown>
                                    </Stack>
                                }
                            />
                        ))}
                    </Box>
                )
                <Stack zIndex={2} position="absolute" maxHeight="100%" width="100%" overflow="auto" bottom={0} left={0}>
                    {codeToTemplateFiles?.length > 0 && (
                        <CodeCheck
                            codeCheckAction={() => fetch(`/api/sandbox/${questionId}/files`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ files: codeToTemplateFiles.map(file => file.file) })
                            })}
                        />
                    )}
                </Stack>
            </Stack>
            )
        }
        </Loading>
    )
}

export default TemplateFilesManager;
