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
import languages from "./languages.json";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const environments = languages.environments;

const TestCases = ({ questionId, language }) => {

    const { data: tests, mutate, error } = useSWR(
        `/api/questions/${questionId}/code/tests`,
        questionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
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
    }, [questionId, tests, mutate]);

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
    )
}


const PullOutputs = ({ onClick }) => {

    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const [source, setSource] = useState("solution");

    const handleClick = () => {
        onClick(source);
    };

    const handleMenuItemClick = (from) => {
        setSource(from);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    return (
        <>
            <ButtonGroup size="small" variant="contained" ref={anchorRef} aria-label="split button">
                <Button onClick={handleClick}>Pull outputs from {source}</Button>
                <Button
                    size="small"
                    aria-controls={open ? 'split-button-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-label="select merge strategy"
                    aria-haspopup="menu"
                    onClick={handleToggle}
                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Popper
                sx={{
                    zIndex: 1,
                }}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu" autoFocusItem>
                                    <MenuItem
                                        key={1}
                                        value={"solution"}
                                        selected={source === "solution"}
                                        onClick={(event) => handleMenuItemClick("solution")}
                                    >
                                        from solution files
                                    </MenuItem>
                                    <MenuItem
                                        key={2}
                                        value={"template"}
                                        selected={source === "template"}
                                        onClick={(event) => handleMenuItemClick( "template")}
                                    >
                                        from template files
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
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
