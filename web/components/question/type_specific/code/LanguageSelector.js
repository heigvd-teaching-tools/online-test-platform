import DropDown from "../../../input/DropDown";
import {Box, MenuItem, Stack, Typography} from "@mui/material";
import Image from "next/image";
import React from "react";
import languages from "./languages.json";

const environments = languages.environments;

const LanguageSelector = ({ language, onChange }) => {
    return(
        <DropDown
            id="language"
            name="Language"
            defaultValue={language}
            minWidth="200px"
            onChange={onChange}
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

export default LanguageSelector;
