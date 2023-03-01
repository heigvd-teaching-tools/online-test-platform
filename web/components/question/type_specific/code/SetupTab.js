import React, {useCallback, useState} from "react";
import {Box, Stack } from "@mui/material";

import languages from "./languages.json";

import TestCases from "./TestCases";
import LanguageSelector from "./LanguageSelector";
import Sandbox from "./Sandbox";

const SetupTab = ({ code, question, onChangeLanguage }) => {

    return (
        <Stack direction="column" padding={2} spacing={2} height="100%">
            <Box>
                <LanguageSelector
                    language={code.language}
                    onChange={onChangeLanguage}
                />
            </Box>

            <Sandbox
                code={code}
                language={code.language}
                question={question}
            />

            <TestCases
                language={code.language}
                question={question}
            />

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
