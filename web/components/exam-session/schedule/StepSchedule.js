import { useState, useEffect } from 'react';
import { Stack, StepLabel, StepContent, Typography, List, FormGroup, FormControlLabel, Switch } from '@mui/material';
import DurationPicker from '../../input/DurationPicker';
import UserAvatar from '../../layout/UserAvatar';

const StepSchedule = ({ examSession, onChange }) => {
    const [ useDuration, setUseDuration ] = useState(false);
    const [ duration, setDuration ] = useState({
        hours: 0,
        minutes: 0,
    });

    useEffect(() => {
        onChange(duration);
    }, [duration]);

    return (
        <>
        <StepLabel>Scheduling and Registration</StepLabel>
        <StepContent>
            <Stack spacing={2} pt={2}>  
                <FormGroup>
                    <FormControlLabel 
                        control={
                            <Switch
                                checked={useDuration}
                                onChange={(e) => {
                                    setUseDuration(e.target.checked);
                                    if (!e.target.checked) {
                                        setDuration(undefined);
                                    }
                                }}
                            />
                        } 
                        label="Set session duration" 
                    />
                </FormGroup>
                {useDuration && (
                    <DurationPicker
                        value={{
                            hours: 0,
                            minutes: 45,
                        }}
                        onChange={(value) => {
                            if(duration && (value.hours !== duration.hours || value.minutes !== duration.minutes)) {
                                setDuration(value);
                            }
                        }}
                    />
                )}
                
                <Typography variant="h6">{examSession.students.length} registered students</Typography>
                {examSession.students && examSession.students.length > 0 && (
                    <>
                        
                        <List>
                            {examSession.students.map((student, index) => (
                                <UserAvatar key={index} user={student.user} />
                            ))}
                        </List>
                    </>
                )}
            </Stack>
        </StepContent>
        </>
    )
}

export default StepSchedule;