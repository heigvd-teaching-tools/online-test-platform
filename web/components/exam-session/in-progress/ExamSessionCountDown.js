import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { Typography, Chip } from '@mui/material';
import DateCountdown from '../../ui/DateCountdown';

const ExamSessionCountDown = ({ untilDate, onFinish }) => {
    return (
        <Chip 
            avatar={<AccessAlarmIcon style={{ color: '#01579b'}} />}
            label={
                <Typography variant="button">
                    <DateCountdown 
                        untilDate={untilDate} 
                        onFinish={onFinish}
                        
                    />
                </Typography>
            } 
        />
    )
}

export default ExamSessionCountDown;