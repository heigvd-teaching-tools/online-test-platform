
import { useEffect } from 'react';
import { useInput } from '../../../utils/useInput';
import { Step, StepLabel, StepContent, Stack, TextField } from '@mui/material';

const StepGeneralInformation = ({ examSession, onChange }) => {

    const { value:label, bind:bindLabel, setValue:setLabel, setError:setErrorLabel } = useInput(examSession.label);
    const { value:conditions, bind:bindConditions, setValue:setConditions } = useInput(examSession.conditions);

    useEffect(() => {
        if(label.length === 0){
            setErrorLabel({ error: true, helperText: 'Label is required' });
        }
        onChange({
            label,
            conditions
        });
    }, [label, conditions, onChange, setErrorLabel]);

    return(
        <>
        <StepLabel>General informations</StepLabel>
        <StepContent>
            <Stack spacing={2} pt={2}>
                <TextField
                    label="Label"
                    id="exam-label"
                    fullWidth
                    value={label}
                    {...bindLabel}
                />

                <TextField
                    label="Conditions"
                    id="exam-conditions"
                    fullWidth
                    multiline
                    rows={4}
                    value={conditions}
                    {...bindConditions}
                />
                
            </Stack>
        </StepContent>
        </>
    )
};

export default StepGeneralInformation;