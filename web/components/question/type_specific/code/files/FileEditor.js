import languages from "../languages.json";
import React, {useEffect, useState} from "react";
import {Stack, TextField} from "@mui/material";
import InlineMonacoEditor from "../../../../input/InlineMonacoEditor";
import {useDebouncedCallback} from "use-debounce";

const languageBasedOnPathExtension = (path) => {
    if (!path) return null;
    const extension = path.split('.').pop();
    return languages.monacoExtensionToLanguage[extension];
}

const FileEditor = ({ file, onChange, secondaryActions }) => {

    // automatically set language based on path extension
    const [ language, setLanguage ] = useState(languageBasedOnPathExtension(file?.path));

    const [ path, setPath ] = useState(file?.path);
    const [ content, setContent ] = useState(file?.content);

    useEffect(() => {
        setPath(file?.path);
        setContent(file?.content);
        setLanguage(languageBasedOnPathExtension(file?.path) || "text");
    }, [file?.id, file?.path, file?.content]);

    const debouncedOnChange = useDebouncedCallback(onChange, 500);

    return (
        file && (
            <Stack position="relative">
                <Stack position="sticky" zIndex={1} bgcolor="white" top={0} direction="row" p={2} alignItems="center" justifyContent="flex-start">
                    <TextField
                        id={`${file.id}-${path}`}
                        variant="standard"
                        label={`Path [syntax: ${language}]`}
                        value={path}
                        fullWidth
                        onChange={(ev) => {
                            if(ev.target.value === file?.content) return;
                            setPath(ev.target.value);
                            debouncedOnChange({
                                ...file,
                                path: ev.target.value
                            });
                        }}
                    />
                    {secondaryActions}


                </Stack>
                <InlineMonacoEditor
                    code={content}
                    language={languageBasedOnPathExtension(path)}
                    onChange={(code) => {
                        if(code === file?.content) return;
                        setContent(code);
                        debouncedOnChange({
                            ...file,
                            content: code
                        });
                    }}
                />
            </Stack>
        )
    )
}

export default FileEditor;
