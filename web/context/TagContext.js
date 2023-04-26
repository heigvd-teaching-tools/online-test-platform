import React, {createContext, useState, useContext, useCallback, useEffect} from 'react';
import {useSession} from "next-auth/react";
import {useSnackbar} from "./SnackbarContext";
import useSWR from "swr";

const TagsContext = createContext();
export const useTags = () => useContext(TagsContext);

export const TagsProvider = ({ children }) => {

    const { data: tags, mutate, error } = useSWR(`/api/questions/tags`,
        (...args) => fetch(...args).then((res) => res.json()),
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

    return (
        <TagsContext.Provider value={{
            tags,
            upsert
        }}>
            {children}
        </TagsContext.Provider>
    );
}
