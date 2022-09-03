import { useEffect, useState } from 'react';
import {  Grid, Stack, TextField, IconButton, ToggleButton, Button, Typography  } from "@mui/material"

import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';

const MultipleChoice = ({ options:initial, onChange, mode = "update"}) => {
    
    const [options, setOptions] = useState();

    useEffect(() => {
        if (initial) {
            if (initial && initial.length > 0) {
                setOptions(initial);
            }else{
                setOptions(defaultOptions);
            }
        }
    }, [initial]);

    return(
        <Stack direction="column" spacing={1} alignItems="flex-start">
            { mode === "update" && (
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
            )}
            
            <Grid container display="grid" rowSpacing={2} gridTemplateColumns={"repeat(2, 1fr)"}>
                {options && options.length > 0 && options.map((option, index) =>
                    <Grid item key={index}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" alignItems="center" spacing={2}>
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
                                { mode === "update" && (<>
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
                                    </IconButton></>
                                )}

                                { mode === "read" && (
                                    <Typography variant="body2">
                                        {option.text}
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>
                    </Grid>
                )}
            </Grid>
        </Stack>
    )
}

const defaultOptions = [
    {
        text: 'Option 1',
        isCorrect: true
    },
    {
        text: 'Option 2',
        isCorrect: false
    }
];

export default MultipleChoice;