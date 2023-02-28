import React, {useCallback, useEffect, useState} from "react";
import {Box, Button, IconButton, MenuItem, Stack, TextField, Typography, useTheme} from "@mui/material";
import DropDown from "../../../input/DropDown";
import Image from "next/image";

import languages from "./languages.json";
import {useDebouncedCallback} from "use-debounce";

const environments = languages.environments;

const SetupTab = ({ code: initial, onChange }) => {


    const [ sandbox, setSandbox ] = useState(initial.sandbox);

    const [ tests, setTests ] = useState(initial.testCases || []);

    const onChangeLanguage = useCallback((language) => {
        let env = environments.find(env => env.language === language);
        let toChange = {
            language: language
        }
        if (env) {
            // prefill sandbox fields
            let newSandbox = {
                ...sandbox, // we need the old sandbox to send the primary key (questionId) to backend, backend will update the existing sandbox
                "image": env.sandbox.image,
                "beforeAll": env.sandbox.beforeAll,
            }
            setSandbox(newSandbox);
            toChange.sandbox = newSandbox;
        }
        onChange(toChange);
    }, [onChange, sandbox]);

    return (
        <Stack direction="column" padding={2} spacing={2} height="100%">
            <Box>
                <LanguageSelector
                    language={initial.language}
                    onChange={onChangeLanguage}
                />
            </Box>

            <SandboxFields
                language={initial.language}
                sandbox={sandbox}
                onChange={(what, value) => {
                    const newSandbox = {...sandbox, [what]: value};
                    setSandbox(newSandbox);
                    onChange({ sandbox: newSandbox });
                }}
            />

            <Stack direction="row" spacing={2} justifyContent="space-between">
                <Typography variant="h6">Test Cases</Typography>
                <Button color="primary">Add new test case</Button>
            </Stack>

            <Stack direction="column" flexGrow={1} position="relative" >
                <Stack spacing={2} position="absolute" left={0} right={0} top={0} bottom={0} overflow="auto">
                    {tests.map((test, i) => (
                        <TestCaseUpdate test={test} index={i} key={i} />
                    ))}
                </Stack>
            </Stack>

        </Stack>
    )
}

const LanguageSelector = ({ language, onChange }) => {
    return(
        <DropDown
            id="language"
            name="Language"
            defaultValue={language || "cpp"}
            minWidth="200px"
            onChange={(onChange)}
        >
            {environments.map((env, i) => (
                <MenuItem key={i} value={env.language}>
                    <Stack direction="row" alignItems="center" spacing={1} mt={1} mb={1}>
                        <Box sx={{ width: 24, height: 24 }}>
                            <Image src={env.icon} alt={env.value} width={24} height={24} />
                        </Box>
                        <Typography variant="body1">
                            {env.label}
                        </Typography>
                    </Stack>
                </MenuItem>)
            )}
        </DropDown>
    )

}

const SandboxFields = ({ sandbox, onChange }) => {

    const [ image, setImage ] = useState(sandbox?.image);
    const [ beforeAll, setBeforeAll ] = useState(sandbox?.beforeAll);

    useEffect(() => {
        setImage(sandbox?.image);
        setBeforeAll(sandbox?.beforeAll);
    }, [sandbox]);

    const debouncedOnChange = useDebouncedCallback(onChange, 500);

    return (
        <>
            <Typography variant="h6">Sandbox</Typography>
            <Stack direction="row" spacing={2}>
                <TextField
                    id="image"
                    label="Image"
                    variant="standard"
                    value={image}
                    onChange={(ev) => {
                        setImage(ev.target.value);
                        debouncedOnChange("image", ev.target.value)
                    }}
                />
                <TextField
                    id="compile"
                    label="Before All"
                    variant="standard"
                    value={beforeAll}
                    fullWidth
                    onChange={(ev) => {
                        setBeforeAll(ev.target.value);
                        debouncedOnChange("beforeAll", ev.target.value)
                    }}
                />
            </Stack>
        </>
)
}

const TestCaseUpdate = ({ test, index }) => {
    const theme = useTheme();
    const [ input, setInput ] = useState(test.input);
    const [ output, setOutput ] = useState(test.output);
    const [ exec, setExec ] = useState(test.exec);

    return (
        <Stack direction="row" spacing={2}>
            <Stack borderRight={`3px solid ${theme.palette.info.main}`} pr={1} height="100%" alignItems="center">
                <Typography color={theme.palette.info.main} variant="body1"><b>{index+1}</b></Typography>
            </Stack>
            <TextField
                id="exec"
                label="Exec"
                variant="standard"
                value={exec}
                onChange={(ev) => setExec(ev.target.value)}
            />
            <Stack direction="row" spacing={2} flexGrow={1}>
                <TextField
                    id="input"
                    label="Input"
                    variant="standard"
                    multiline
                    fullWidth
                    value={input}
                    onChange={(ev) => setInput(ev.target.value)}

                />
                <TextField
                    id="output"
                    label="Output"
                    multiline
                    fullWidth
                    variant="standard"
                    value={output}
                    onChange={(ev) => setOutput(ev.target.value)}
                />
            </Stack>
            <IconButton key="delete-test-case" onClick={() => {

            }}>
                <Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />
            </IconButton>
        </Stack>
    )
}

export default SetupTab;

/*
[
        {
            "exec": sandbox?.exec,
            "input": "test world\ntest world2\ntest world3",
            "output": "TEST WORLD\nTEST WORLD2\nTEST WORLD3"
        },{
            "exec": sandbox?.exec,
            "input": "Hello World1",
            "output": "HELLO WORLD1"
        },{
            "exec": sandbox?.exec,
            "input": "Hello World2",
            "output": "HELLO WORLD2"
        }
    ]

*/
