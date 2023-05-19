import { useEffect, useState } from 'react';
import { Stack, TextField, Typography } from '@mui/material';

const StepGeneralInformation = ({ jamSession, onChange }) => {

    const [ label, setLabel ] = useState(jamSession && jamSession.label ? jamSession.label : '');
    const [ errorLabel, setErrorLabel ] = useState(false);
    const [ conditions, setConditions ] = useState(jamSession && jamSession.conditions ? jamSession.conditions : '');

    useEffect(() => {
        if(!label && jamSession){
            setLabel(jamSession.label);
            setErrorLabel({ error: false });
            setConditions(jamSession.conditions);
        }
    }, [jamSession, setLabel, setErrorLabel, setConditions, label, conditions]);

    useEffect(() => {
        onChange({
            label,
            conditions
        });
    }, [label, conditions, setErrorLabel, onChange]);

    useEffect(() => {
        let error = !label || label.length === 0;
        setErrorLabel(error);
        if(error){
            setLabel('');
        }

    }, [label, setErrorLabel, setLabel]);

    return(
        <Stack spacing={2} pt={2}>
            <Typography variant="h6">General Informations</Typography>
            <TextField
                label="Label"
                id="jam-session-label"
                fullWidth
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                error={errorLabel}
                helperText={errorLabel ? 'Label is required' : ''}
            />

            <TextField
                label="Conditions"
                id="jam-session-conditions"
                fullWidth
                multiline
                rows={4}
                value={conditions || ''}
                onChange={(e) => setConditions(e.target.value)}
            />
        </Stack>
    )
};

export default StepGeneralInformation;
