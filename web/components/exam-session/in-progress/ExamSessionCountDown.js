import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { Typography, Chip, Box } from '@mui/material';
import DateCountdown from '../../ui/DateCountdown';

const ExamSessionCountDown = ({ startDate, endDate, onFinish }) => {

    // percentage of now between start and end
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const percentage = elapsed / duration * 100;
    console.log(parseInt(percentage));


    return (
        <Chip 
            avatar={<Pie percentage={parseInt(percentage)}  />}
            label={
                <Typography variant="button">
                    <DateCountdown 
                        untilDate={endDate} 
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
        <circle r="10" cx="10" cy="10" fill="#01579b" />
        <circle r="5" cx="10" cy="10" fill="transparent"
                stroke="white"
                strokeWidth="10"
                strokeDasharray={`calc(35 * ${percentage} / 100) 31.5`}
                transform="rotate(-90) translate(-20)" />
        </svg>
    </Box>
);
export default ExamSessionCountDown;