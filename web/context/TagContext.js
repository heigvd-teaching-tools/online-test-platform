import React, {createContext, useContext, useCallback } from 'react';
import useSWR from "swr";

const TagsContext = createContext();
export const useTags = () => useContext(TagsContext);

export const TagsProvider = ({ children }) => {

    const { data: tags, mutate, error } = useSWR(`/api/questions/tags`,
        async (url) => {
            const response = await fetch(url);
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return data;
        },
        { fallbackData: [] }
    );

    const upsert = useCallback(async (questionId, tags) => {
        return await fetch(`/api/questions/${questionId}/tags`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                tags
            })
        })
        .then((res) => res.json())
        .then(async (updated) => {
            await mutate(updated);
        });
    } , [mutate]);

    if(error) return children // they wont have access to tags

    return (
        <TagsContext.Provider value={{
            tags,
            upsert
        }}>
            {children}
        </TagsContext.Provider>
    );
}
