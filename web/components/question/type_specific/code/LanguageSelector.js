import DropDown from "../../../input/DropDown";
import {Box, Button, MenuItem, Stack, Typography} from "@mui/material";
import Image from "next/image";
import React, {useCallback, useState} from "react";
import languages from "./languages.json";
import AlertFeedback from "../../../feedback/AlertFeedback";

const environments = languages.environments;


const LanguageSelector = ({ questionId, onChange }) => {
    const [language, setLanguage] = useState(environments[0].language);

    const onSelectLanguage = useCallback(async () => {
        await fetch(`/api/questions/${questionId}/code`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(codeBasedOnLanguage(language))
        })
        .then(data => data.json())
        .then(async (data) => {
            onChange(data.language);
        });
    }, [questionId, language, onChange]);

    return(
        <Stack padding={2} spacing={2}>
            <DropDown
                id="language"
                name="Language"
                defaultValue={language}
                minWidth="200px"
                onChange={setLanguage}
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
            <AlertFeedback severity="warning">
                <Typography variant="body1">You would not be able to change the language of a question once it is selected.</Typography>
            </AlertFeedback>
            <Button variant="outlined" onClick={onSelectLanguage}>Chose Language</Button>
        </Stack>
    )

}


const codeBasedOnLanguage = (language) => {
    const index = environments.findIndex(env => env.language === language);
    return {
        language: environments[index].language,
        sandbox: {
            image: environments[index].sandbox.image,
            beforeAll: environments[index].sandbox.beforeAll

        },
        files: {
            template: environments[index].files.template,
            solution: environments[index].files.solution
        },
        testCases: environments[index].testCases
    }
}


export default LanguageSelector;
