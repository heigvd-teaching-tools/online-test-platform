import React, {useEffect, useState} from "react";
import {useDebouncedCallback} from "use-debounce";
import {Stack, TextField, Typography} from "@mui/material";
import useSWR from "swr";
import languages from "./languages.json";

const environments = languages.environments;
const Sandbox = ({ question, language }) => {

    const { data: sandbox, mutate, error } = useSWR(
        `/api/questions/${question.id}/code/sandbox`,
        question.id ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus: false }
    );

    const [ image, setImage ] = useState(sandbox?.image);
    const [ beforeAll, setBeforeAll ] = useState(sandbox?.beforeAll);

    useEffect(() => {
        setImage(sandbox?.image);
        setBeforeAll(sandbox?.beforeAll);
    }, [sandbox]);

    useEffect(() => {
        // detecting the language change
        if(sandbox){
            const env = environments.find(env => env.language === language);
            if (env) {
                setImage(env.sandbox.image);
                setBeforeAll(env.sandbox.beforeAll);
                debouncedOnChange({
                    image: env.sandbox.image,
                    beforeAll: env.sandbox.beforeAll
                })
            }
        }
    }, [language, environments]);

    const onChange = async (sandbox) => {
        await fetch(`/api/questions/${question.id}/code/sandbox`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                ...sandbox
            })
        })
        .then(async (res) => {
            if (res.status === 200) {
                await mutate();
            }
        });
    }

    const debouncedOnChange = useDebouncedCallback(onChange, 500);

    return (
            image && (
            <>
                <Typography variant="h6">Sandbox</Typography>
                <Stack direction="row" spacing={2}>
                    <TextField
                        id="image"
                        label="Image"
                        variant="standard"
                        value={image}
                        onChange={(ev) => {
                            setImage(ev.target.value);
                            debouncedOnChange({
                                ...sandbox,
                                image: ev.target.value
                            })
                        }}
                    />
                    <TextField
                        id="compile"
                        label="Before All"
                        variant="standard"
                        value={beforeAll}
                        fullWidth
                        onChange={(ev) => {
                            setBeforeAll(ev.target.value);
                            debouncedOnChange({
                                ...sandbox,
                                beforeAll: ev.target.value
                            })
                        }}
                    />
                </Stack>
            </>)
    )
}

export default Sandbox;
