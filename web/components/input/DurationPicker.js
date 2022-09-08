import { useEffect } from 'react';

import { Stack, MenuItem } from '@mui/material';
import { useInput } from '../../utils/useInput';
import DropDown from './DropDown';
import { Box } from '@mui/system';

const DurationPicker = ({ value, onChange }) => {
    const { value:hours, bind:bindHours, setValue:setHours } = useInput(value.hours);
    const { value:minutes, bind:bindMinutes, setValue:setMinutes } = useInput(value.minutes);

    useEffect(() => {
        onChange({
            hours,
            minutes
        });
    }, [hours, minutes, onChange]);

    return(
        <Box sx={{ width:'150px'}}>
        <Stack direction="row" spacing={2}>
            <DropDown
                id={'hours'}
                name={'Hours'}
                defaultValue={hours}
                onChange={setHours}
                minWidth={'70px'}
            >
                {
                    [...Array(24).keys()].map((item) => (
                        <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))
                }
            </DropDown>
            <DropDown
                id={'minutes'}
                name={'Minutes'}
                defaultValue={minutes}
                onChange={setMinutes}
                minWidth={'80px'}
            >
                {
                    [...Array(60/5).keys()].map((item) => (
                        <MenuItem key={item*5} value={item*5}>{item*5}</MenuItem>
                    ))
                }
            </DropDown>

        </Stack>
        </Box>
    )
}

export default DurationPicker;