import {Autocomplete, Chip, TextField} from "@mui/material";
import {createFilterOptions} from "@mui/material/Autocomplete";
import {useTags} from "../../context/TagContext";
import {useCallback, useState} from "react";
import useSWR from "swr";

const filterOptions = createFilterOptions({
    matchFrom: 'start',
    ignoreCase: true,
    ignoreAccents: true,
    limit: 20, // suggestions limit
    stringify: (option) => option,
});

const QuestionTagSelector = ({ questionId } ) => {

    const { tags:allTags, upsert } = useTags();

    const { data: tags, mutate, error } = useSWR(`/api/questions/${questionId}/tags`,
        questionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { fallbackData: [] }
    );

    const onChange = useCallback(async (event, newTags) => {
        await upsert(questionId, newTags);
        await mutate(newTags);
    }, [questionId, mutate, upsert]);

    return(
        <Autocomplete
            multiple
            id="tags-outlined"
            options={allTags.map((tag) => tag.label)}
            getOptionLabel={(option) => option}
            value={tags.map((tag) => tag.label)}
            filterSelectedOptions
            filterOptions={filterOptions}
            freeSolo
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip key={index} variant="outlined" label={option} {...getTagProps({ index })} />
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="tags"
                    placeholder="Add tags"
                />
            )}
            onChange={onChange}
        />
    )
}

export default QuestionTagSelector;
