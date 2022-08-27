import { useEffect, useState } from 'react';
import {  Grid, Stack, TextField, IconButton, ToggleButton, Button  } from "@mui/material"

import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';

const MuiltipleChoice = ({content:initial, onChange}) => {
    
    const [options, setOptions] = useState();

    useEffect(() => {
        setOptions(initial && initial.length >= 2 ? initial : [
            {
                text: 'Option 1',
                isCorrect: true
            },
            {
                text: 'Option 2',
                isCorrect: false
            }
        ]);
    }, [initial]);

    return(
        <Stack direction="column" spacing={1} alignItems="flex-start">
            <Button color="primary" startIcon={<AddIcon />} onClick={() => {
                let newOptions = [...options, {
                    text: 'Option',
                    isCorrect: false
                }];
                setOptions(newOptions);
                onChange(newOptions);
            }}>
                Add Option
            </Button>
            <Grid container display="grid" rowSpacing={2} gridTemplateColumns={"repeat(2, 1fr)"}>
                {options && options.length > 0 && options.map((option, index) =>
                    <Grid item key={index}>
                        <Stack direction="row" justifyContent="space-around">
                            <ToggleButton
                                    value="correct"
                                    selected={option.isCorrect}
                                    color='success'
                                    onChange={(e) => {
                                        const newOptions = [...options];
                                        newOptions[index].isCorrect = !newOptions[index].isCorrect;
                                        setOptions(newOptions);
                                        onChange(newOptions);
                                    } }
                                >
                                   { option.isCorrect ? <CheckIcon /> : <ClearIcon /> } 
                                </ToggleButton>
                                <TextField
                                    id="outlined-text"
                                    label={`Option ${index + 1}`}
                                    variant="outlined"
                                    value={option.text}
                                    
                                    onChange={(e) => {
                                        const newOptions = [...options];
                                        newOptions[index].text = e.target.value;
                                        setOptions(newOptions);
                                        onChange(newOptions);
                                    } }
                                />
                                <IconButton variant="small" color="error" onClick={() => {
                                    let newOptions = [...options];
                                    newOptions.splice(index, 1);
                                    setOptions(newOptions);
                                    onChange(newOptions);
                                } }>
                                    <DeleteIcon />
                                </IconButton>
                        </Stack>
                    </Grid>
                )}
            </Grid>
        </Stack>
    )
}

export default MuiltipleChoice;