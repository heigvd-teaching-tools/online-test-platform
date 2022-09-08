import { useState, useEffect } from 'react';
import { Stack, StepLabel, StepContent, Typography, List } from '@mui/material';
import DurationPicker from '../../input/DurationPicker';
import UserAvatar from '../../layout/UserAvatar';

const StepSchedule = ({ examSession, onChange }) => {

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
                <Typography variant="h6">Duration </Typography>
                <DurationPicker
                    value={{
                        hours: 0,
                        minutes: 45,
                    }}
                    onChange={(value) => {
                        if(value.hours !== duration.hours || value.minutes !== duration.minutes) {
                            setDuration(value);
                        }
                    }}
                />
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