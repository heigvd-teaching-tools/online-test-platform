import { useState, useEffect } from 'react';
import { Stack, Box, ToggleButton, Typography  } from "@mui/material"

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const TrueFalse = ({ id = "true_false", isTrue:initial, onChange, allowUndefined = false }) => {

    const [isTrue, setIsTrue] = useState(initial);

    useEffect(() => {
        setIsTrue(initial);
    }, [initial, id]);

    return(
        <Stack id={id} direction="row" justifyContent="flex-start" alignItems="center" spacing={2} padding={2}>
            <ToggleButton value="isTrue" selected={isTrue === true} color='success'
                onChange={() => {
                    let newValue = isTrue === true ? allowUndefined ? undefined : isTrue : true;
                    setIsTrue(newValue);
                    onChange(newValue);
                } }
            >
                { isTrue === true ? <CheckIcon /> : <ClearIcon /> }
            </ToggleButton>
            <Box>
                <Typography variant="body1">True</Typography>
            </Box>

            <ToggleButton value="isTrue" selected={isTrue === false} color='success'
                onChange={() => {
                    let newValue = isTrue === false ? allowUndefined ? undefined : isTrue : false;
                    setIsTrue(newValue);
                    onChange(newValue);
                } }
            >
                { isTrue === false ? <CheckIcon /> : <ClearIcon /> }
            </ToggleButton>
            <Box>
                <Typography variant="body1">False</Typography>
            </Box>
    </Stack>

    )
}

export default TrueFalse;
