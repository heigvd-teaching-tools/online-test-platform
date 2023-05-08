import React, {useCallback, useEffect, useRef, useState} from "react";
import Image from "next/image";
import useSWR from "swr";
import {
    Box,
    Button,
    ButtonGroup, ClickAwayListener,
    Grow,
    IconButton, MenuItem, MenuList,
    Paper,
    Popper,
    Stack,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import {useDebouncedCallback} from "use-debounce";
import languages from "../../../../code/languages.json";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Loading from "../../../feedback/Loading";
import { fetcher } from "../../../../code/utils";

const environments = languages.environments;

const TestCases = ({ questionId, language }) => {

    const { data: tests, mutate, error } = useSWR(
        `/api/questions/${questionId}/code/tests`,
        questionId ? fetcher : null,
        { revalidateOnFocus: false }
    );

    // react on the language change, re-fetch the tests
    useEffect(() => { (async () => await mutate())() }, [language, mutate]);

    const addTestCase = useCallback(async () => {
        const exec = tests.length === 0 ?
            environments.find(env => env.language === language).sandbox.exec
            :
            tests[tests.length - 1].exec;
        await fetch(`/api/questions/${questionId}/code/tests`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                index: tests.length + 1,
                input: "",
                expectedOutput: "",
                exec: exec
            })
        });
        await mutate();

    }, [questionId, tests, mutate, language]);

    const deleteTestCase = useCallback(async (index) => {
        await fetch(`/api/questions/${questionId}/code/tests/${index}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(async (res) => {
            if (res.status === 200) {
                // filter test cases and decrement all indexes after the deleted one
                let newTests = tests
                    .filter((test) => test.index !== index)
                    .map((test) => {
                        if (test.index > index) {
                            test.index--;
                        }
                        return test;
                    });
                await mutate(
                    newTests
                );
            }
        });
    }, [questionId, tests, mutate]);

    const updateTestCase = useCallback(async (test) => {
        await fetch(`/api/questions/${questionId}/code/tests/${test.index}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                exec: test.exec,
                input: test.input,
                expectedOutput: test.expectedOutput,
            })
        });
        await mutate();
    }, [questionId, mutate]);

    const pullOutputs = useCallback(async (source) => {
        const result = await fetch(`/api/sandbox/${questionId}/${source}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json());

        for(const test of tests) {
            await updateTestCase({
                ...test,
                expectedOutput: result.tests[test.index - 1].output
            });
        }
    }, [questionId, tests, updateTestCase]);

    return(
        <Loading
            loading={!tests}
            errors={[error]}
        >
            <Stack spacing={2} height="100%">
                <Stack direction="row" spacing={2} justifyContent="space-between">
                    <Typography variant="h6">Test Cases</Typography>
                    <Box>
                        <Button onClick={() => pullOutputs("solution")}>Pull outputs from solution</Button>
                        <Button color="primary" onClick={addTestCase}>Add new test case</Button>
                    </Box>
                </Stack>

                <Stack direction="column" flexGrow={1} position="relative" >
                    <Stack spacing={2} position="absolute" left={0} right={0} top={0} bottom={0} overflow="auto">
                        {tests?.map((test, i) => (
                            <TestCaseUpdate
                                test={test}
                                key={i}
                                onChange={(updatedTest) => updateTestCase(updatedTest)}
                                onDelete={() => deleteTestCase(test.index)}
                            />
                        ))}
                    </Stack>
                </Stack>
            </Stack>
        </Loading>
    )
}

const TestCaseUpdate = ({ test, onChange, onDelete }) => {
    const theme = useTheme();
    const [ input, setInput ] = useState(test.input);
    const [ expectedOutput, setExpectedOutput ] = useState(test.expectedOutput);
    const [ exec, setExec ] = useState(test.exec);

    useEffect(() => {
        setInput(test.input);
        setExpectedOutput(test.expectedOutput);
        setExec(test.exec);
    }, [test]);

    const debouncedOnChange = useDebouncedCallback(onChange, 300);

    return (
        <Stack direction="row" spacing={2}>
            <Stack borderRight={`3px solid ${theme.palette.info.main}`} pr={1} height="100%" alignItems="center">
                <Typography color={theme.palette.info.main} variant="body1"><b>{test.index}</b></Typography>
            </Stack>
            <TextField
                id="exec"
                label="Exec"
                variant="standard"
                value={exec}
                onChange={(ev) => {
                    setExec(ev.target.value);
                    debouncedOnChange({ ...test, exec: ev.target.value })
                }}
            />
            <Stack direction="row" spacing={2} flexGrow={1}>
                <TextField
                    id="input"
                    label="Input"
                    variant="standard"
                    multiline
                    fullWidth
                    value={input}
                    onChange={(ev) => {
                        setInput(ev.target.value);
                        debouncedOnChange({ ...test, input: ev.target.value })
                    }}

                />
                <TextField
                    id="output"
                    label="Output"
                    multiline
                    fullWidth
                    variant="standard"
                    value={expectedOutput}
                    onChange={(ev) => {
                        setExpectedOutput(ev.target.value);
                        debouncedOnChange({ ...test, expectedOutput: ev.target.value })
                    }}
                />
            </Stack>
            <IconButton key="delete-test-case" onClick={() => onDelete(test.index)}>
                <Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />
            </IconButton>
        </Stack>
    )
}

export default TestCases;
