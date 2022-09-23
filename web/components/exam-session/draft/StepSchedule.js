import { useState, useEffect } from 'react';
import { Stack, Typography, List, FormGroup, FormControlLabel, Switch } from '@mui/material';
import DurationPicker from '../../input/DurationPicker';
import UserAvatar from '../../layout/UserAvatar';

const StepSchedule = ({ examSession, onChange }) => {
    const [ useDuration, setUseDuration ] = useState(false);
    const [ duration, setDuration ] = useState({
        hours: 0,
        minutes: 45,
    });

    useEffect(() => {
        onChange(useDuration ? duration : { hours: 0, minutes: 0 });
    }, [duration, useDuration, onChange]);

    useEffect(() => {
        if(examSession){
            console.log("examSession", examSession);
            if(examSession.durationHours > 0 || examSession.durationMinutes > 0){
                // hours and minutes between startAt and endAt
                setUseDuration(true);
                setDuration({ 
                    hours: examSession.durationHours, 
                    minutes:examSession.durationMinutes
                });
            }
        }
    }, [examSession]);

    return (
       
        <Stack spacing={2}>  
            <Typography variant="h6">Schedule</Typography>
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
                    value={duration}
                    onChange={(value) => {
                        if(duration && (value.hours !== duration.hours || value.minutes !== duration.minutes)) {
                            setDuration(value);
                        }
                    }}
                />
            )}
            <Typography variant="h6">Student registration</Typography>
            {examSession.students && examSession.students.length > 0 && (
                <>
                    <Typography variant="body1">{examSession.students.length} registered students</Typography>
                    <List>
                        {examSession.students.map((student, index) => (
                            <UserAvatar key={index} user={student.user} />
                        ))}
                    </List>
                </>
            )}
        </Stack>
       
    )
}

export default StepSchedule;