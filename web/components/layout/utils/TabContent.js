import React, {useCallback, useState} from "react";
import {Box, Stack } from "@mui/material";

import languages from "../../question/type_specific/code/languages.json";

import TestCases from "../../question/type_specific/code/TestCases";
import LanguageSelector from "../../question/type_specific/code/LanguageSelector";
import Sandbox from "../../question/type_specific/code/Sandbox";

const TabContent = ({ children, padding = 0, spacing = 0 }) =>
    <Stack direction="column" height="100%" padding={padding} spacing={spacing} overflow="auto">
        {children}
    </Stack>

export default TabContent;
