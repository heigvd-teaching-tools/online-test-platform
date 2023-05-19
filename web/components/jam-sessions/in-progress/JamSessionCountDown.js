import { useState, useEffect, useCallback } from 'react';
import { Typography, Chip, Box, Stack } from '@mui/material';
import DateCountdown from '../../ui/DateCountdown';
import PiePercent from '../../feedback/PiePercent';

const JamSessionCountDown = ({ startDate, endDate, onFinish }) => {
    const [ percentage, setPercentage ] = useState(100);

    const updatePercentage = useCallback(() => {
        // percentage of now between start and end
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        const newPercentage = elapsed / duration * 100;
        setPercentage(newPercentage);
    }, [startDate, endDate]);

    useEffect(() => {
        // first render init percentage
        updatePercentage();
    }, []);

    return (
        <Chip
            avatar={
                <Stack alignItems="center" justifyContent="center" sx={{ bgcolor:'white', borderRadius:'50%' }}>
                <PiePercent
                    value={percentage}
                    size={24}
                    thickness={22}
                    label=" "
                    colors={{
                        0: '#2e7d32',
                        40: '#0288d1',
                        70: '#d32f2f'
                    }}
                />
                </Stack>
            }
            label={
                <Typography variant="button">
                    <DateCountdown
                        untilDate={endDate}
                        onTic={updatePercentage}
                        onFinish={onFinish}
                    />
                </Typography>
            }
        />
    )
}

const Pie = ({percentage}) => (
    <Box sx={{ padding:'4px 0px 0px 6px' }}>
    <svg height="20" width="20" viewBox="0 0 20 20">
        <circle r="10" cx="10" cy="10" fill="#da291c" />
        <circle r="5" cx="10" cy="10" fill="transparent"
                stroke="white"
                strokeWidth="10"
                strokeDasharray={`calc(35 * ${percentage} / 100) 31.5`}
                transform="rotate(-90) translate(-20)" />
        </svg>
    </Box>
);
export default JamSessionCountDown;
