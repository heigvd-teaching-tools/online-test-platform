import React, {createContext, useContext, useCallback, useEffect} from 'react';
import useSWR from "swr";
import { Role } from '@prisma/client';
import {useSession} from "next-auth/react";
import { fetcher } from "../code/utils"

const TagsContext = createContext();
export const useTags = () => useContext(TagsContext);

const isProfessor = (user) => user?.role === Role.PROFESSOR;

export const TagsProvider = ({ children }) => {

    const { data: session } = useSession();

    const { data: tags, mutate, error } = useSWR(`/api/questions/tags`,
        isProfessor(session?.user) ?
        fetcher : null,
        { fallbackData: [] }
    );

    useEffect(() => {
        if(session) {
            (async () => {
                await mutate();
            })();
        }
    }, [session, mutate]);

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
            tags: tags || [],
            upsert
        }}>
            {children}
        </TagsContext.Provider>
    );
}
