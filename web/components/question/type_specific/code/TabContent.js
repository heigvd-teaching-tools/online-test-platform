import React, {useCallback, useState} from "react";
import {Box, Stack } from "@mui/material";

import languages from "./languages.json";

import TestCases from "./TestCases";
import LanguageSelector from "./LanguageSelector";
import Sandbox from "./Sandbox";

const TabContent = ({ children, padding = 0, spacing = 0 }) => {

    return (
        <Stack direction="column" height="100%" padding={padding} spacing={spacing} overflow="hidden">
            {children}
        </Stack>
    )
}


export default TabContent;
