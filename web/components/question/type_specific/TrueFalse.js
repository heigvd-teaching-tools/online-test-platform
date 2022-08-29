import { useState } from 'react';
import { Stack, Box, ToggleButton, Typography  } from "@mui/material"

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const TrueFalse = ({content:initial, onChange}) => {
    
    const [isTrue, setIsTrue] = useState(initial.isTrue);    

    return(
        <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
            <ToggleButton value="isTrue" selected={isTrue} color='success'
                onChange={() => {
                    setIsTrue(true);
                    onChange({isTrue: true});
                } }
            >
                { isTrue ? <CheckIcon /> : <ClearIcon /> } 
            </ToggleButton>
            <Box>
                <Typography variant="h6">True</Typography>
            </Box>
        
            <ToggleButton value="isTrue" selected={!isTrue} color='success'
                onChange={() => {
                    setIsTrue(false);
                    onChange({isTrue: false});
                } }
            >
                { !isTrue ? <CheckIcon /> : <ClearIcon /> } 
            </ToggleButton>
            <Box>
                <Typography variant="h6">False</Typography>
            </Box>
    </Stack>

    )
}

export default TrueFalse;