import {useCallback, useState} from "react";
import {Box, Button, Checkbox, Stack, TextField, Typography} from "@mui/material";

import types from "./types.json";
import languages from "../../code/languages.json";
import {useTags} from "../../context/TagContext";
import TagsSelector from "../input/TagsSelector";
const environments = languages.environments;

const initialFilters = {
    title: "",
    content: "",
    tags: [],
    questionTypes: types.map((type) => type.value).reduce((obj, type) => ({ ...obj, [type]: true }), {}),
    codeLanguages: environments.map((language) => language.language).reduce((obj, language) => ({ ...obj, [language]: true }), {}),
};

const QuestionFilter = ({ onFilter }) => {

    const { tags:allTags } = useTags();

    const [ filter, setFilter ] = useState(initialFilters);

    const applyFilter = useCallback(async (toApply) => {
        const query = {...toApply};
        query.questionTypes = Object.keys(query.questionTypes).filter((key) => query.questionTypes[key]);
        if(!query.questionTypes.code) {
            delete query.codeLanguages;
        }
        if(query.codeLanguages){
            query.codeLanguages = Object.keys(query.codeLanguages).filter((key) => query.codeLanguages[key]);
        }
        if(onFilter){
            onFilter(query);
        }
    }, [onFilter]);

    return (
        filter &&
        <Stack spacing={2} padding={2}>
            <Typography variant="body2" color="info"> Filters</Typography>
            <TextField
                label={"Filter by title"}
                variant="outlined"
                fullWidth
                autoFocus
                color="info"
                size="small"
                value={filter.title}
                onChange={(e) => setFilter({ ...filter, title: e.target.value })}
            />

            <TextField
                label={"Filter by content"}
                variant="outlined"
                fullWidth
                color="info"
                size="small"
                value={filter.content}
                onChange={(e) => setFilter({ ...filter, content: e.target.value })}
            />

            <TagsSelector
                label={"Filter by tags"}
                size={"small"}
                color={"info"}
                options={allTags.map((tag) => tag.label)}
                value={filter.tags}
                onChange={(newTags) => setFilter({ ...filter, tags: newTags })}
            />

            <Typography variant="body2" color="info"> Question types </Typography>
            <Box>
                {types.map((type) => (
                    <CheckboxLabel
                        key={type.value}
                        label={type.label}
                        checked={filter.questionTypes[type.value]}
                        onChange={(checked) => setFilter({ ...filter, questionTypes: { ...filter.questionTypes, [type.value]: checked } })}
                    />
                ))}
            </Box>
            { filter.questionTypes.code &&
                <>
                    <Typography variant="body2" color="info"> Code languages </Typography>
                    <Box>
                        {environments.map((language) => (
                            <CheckboxLabel
                                key={language.language}
                                label={language.label}
                                checked={filter.codeLanguages[language.language]}
                                onChange={(checked) => setFilter({ ...filter, codeLanguages: { ...filter.codeLanguages, [language.language]: checked } })}
                            />
                        ))}
                    </Box>
                </>
            }
            <Stack direction={"row"} spacing={2}>
            <Button variant="contained" color="info" fullWidth onClick={() => applyFilter(filter)}> Filter </Button>
            <Button variant="outlined" onClick={async () => {
                setFilter(initialFilters);
                await applyFilter(initialFilters);
            }}> Clear </Button>
            </Stack>
        </Stack>
    )
};
const CheckboxLabel = ({label, checked, onChange}) => {
    const setToggleCheckBox = useCallback(() => onChange && onChange(!checked), [onChange]);
    return (
        <Stack direction="row" alignItems="center" onClick={ setToggleCheckBox } sx={{ cursor: "pointer" }}>
            <Checkbox size={"small"} checked={checked} color={"info"} onChange={(e) => onChange(e.target.checked)} />
            <Typography variant="body1" color="info"> {label} </Typography>
        </Stack>
    )
}

export default QuestionFilter;
