import useSWR from "swr";
import {useCallback} from "react";
import MultipleChoice from "./MultipleChoice";

const UpdateMultipleChoice = ({ questionId }) => {

    const { data: options, mutate, error } = useSWR(
        `/api/questions/${questionId}/multiple-choice/options`,
        questionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus: false }
    );

    const onChangeOptions = useCallback(async (index, options) => {
        const updatedOption = options[index];
        await fetch(`/api/questions/${questionId}/multiple-choice/options`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                option: updatedOption
            })
        }).then(async (res) => {
            if (res.status === 200) {
                await mutate(options);
            }
        });
    }, [questionId, mutate]);

    const onDeleteOption = useCallback(async (_, deletedOption) => {
        await fetch(`/api/questions/${questionId}/multiple-choice/options`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                option: deletedOption
            })
        }).then(async (res) => {
            if (res.status === 200) {
                await mutate();
            }
        });
    }, [questionId, mutate]);

    const onAddOption = useCallback(async () => {
        await fetch(`/api/questions/${questionId}/multiple-choice/options`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                option: { text: "", isCorrect: false }
            })
        }).then(async (res) => {
            if (res.status === 200) {
                await mutate();
            }
        });
    }, [questionId, mutate]);

    return (
        <MultipleChoice
            options={options}
            onAdd={onAddOption}
            onChange={async (changedIndex, newOptions) => {
                await onChangeOptions(changedIndex, newOptions);
            }}
            onDelete={async (deletedIndex, deletedOption) => {
                await onDeleteOption(deletedIndex, deletedOption);
            }}
        />
    )
}

export default UpdateMultipleChoice;
