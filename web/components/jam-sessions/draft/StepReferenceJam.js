import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Stack, TextField, Autocomplete, Typography } from '@mui/material';

import AlertFeedback from '../../feedback/AlertFeedback';

const StepReferenceJam = ({ jamSession, onChange }) => {

    const [ selectedCollection, setSelectedCollection ] = useState(null);
    const [ input, setInput ] = useState('');

    const { data: collections } = useSWR(
        `/api/collections`,
        (...args) => fetch(...args).then((res) => res.json())
    );

    const { data: jamSessionQuestions } = useSWR(
        `/api/jam-sessions/${jamSession && jamSession.id}/questions/with-answers/official`,
        jamSession && jamSession.id ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const { data: collectionQuestions } = useSWR(
        `/api/collections/${selectedCollection && selectedCollection.id}/questions`,
        selectedCollection ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    useEffect(() => {
        onChange(selectedCollection, collectionQuestions);
    }, [selectedCollection, collectionQuestions, onChange]);

    useEffect(() => {
        if(selectedCollection){
            onChange(selectedCollection);
        }
    }, [selectedCollection, onChange]);

    const hasQuestions = () => (jamSessionQuestions && jamSessionQuestions.length > 0) || (collectionQuestions && collectionQuestions.length > 0);

    return (
        <Stack spacing={2} pt={2}>
                <Typography variant="h6">Reference Collection</Typography>
                <Autocomplete
                    id="collection-id"
                    inputValue={input}
                    options={collections || []}
                    renderInput={(params) =>
                        <TextField
                            {...params}
                            label="Find the reference collection"
                            error={!hasQuestions()}
                            helperText={!hasQuestions() && 'Please select the reference collections'}
                        />

                    }
                    noOptionsText="No collections found"

                    onInputChange={(event, newInputValue) => {
                        setInput(newInputValue);
                    }}
                    onChange={(_, collection) => {
                        console.log("onChange collection", collection)
                        setSelectedCollection(collection);
                    }}
                />

                { selectedCollection &&
                    <AlertFeedback severity="info">
                        The reference collection contains {selectedCollection.collectionToQuestions.length} questions. Their copy will be assigned for this jam session.
                    </AlertFeedback>
                }

                { jamSessionQuestions && selectedCollection && jamSessionQuestions.length > 0 &&
                    <AlertFeedback severity="warning">
                        This jam session already has {jamSessionQuestions.length} questions. They will be replaced by the questions of the reference jam.
                    </AlertFeedback>
                }

                { jamSessionQuestions && jamSessionQuestions.length > 0 &&
                    <AlertFeedback severity="success">
                        This jam session has {jamSessionQuestions.length} questions.
                    </AlertFeedback>
                }

            </Stack>
    )
}

export default StepReferenceJam;
