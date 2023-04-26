import { useTags } from "../../../context/TagContext";
import { useCallback } from "react";
import useSWR from "swr";
import TagsSelector from "../../input/TagsSelector";

const QuestionTagsSelector = ({ questionId } ) => {

    const { tags:allTags, upsert } = useTags();

    const { data: tags, mutate, error } = useSWR(`/api/questions/${questionId}/tags`,
        questionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { fallbackData: [] }
    );

    const onChange = useCallback(async (newTags) => {
        await upsert(questionId, newTags);
        await mutate(newTags);
    }, [questionId, mutate, upsert]);

    return(
        <TagsSelector
            options={allTags.map((tag) => tag.label)}
            value={tags.map((tag) => tag.label)}
            onChange={onChange}
        />
    )
}

export default QuestionTagsSelector;
