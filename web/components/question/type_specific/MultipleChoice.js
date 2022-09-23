import { useEffect, useState } from 'react';
import {  Grid, Stack, TextField, IconButton, ToggleButton, Button, Typography  } from "@mui/material"

import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';

const MultipleChoice = ({ id = "multi_choice", options:initial, onChange, selectOnly = false}) => {
    console.log("MultipleChoice", id, initial, onChange, selectOnly);
    const [options, setOptions] = useState();

    useEffect(() => {
        if (initial) {
            if (initial && initial.length > 0) {
                setOptions(initial);
            }else{
                setOptions(defaultOptions);
            }
        }
    }, [initial, id]);

    return(
        <Stack id={id} direction="column" spacing={1} alignItems="flex-start">
            { !selectOnly && (
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
            
            <Grid container display="grid" columnGap={4} rowSpacing={2} gridTemplateColumns={"repeat(2, 1fr)"}>
                {options && options.length > 0 && options.map((option, index) =>
                    <Grid item key={index}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ flex:1 }}>
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
                                { !selectOnly && (<>
                                    <TextField
                                        id="outlined-text"
                                        label={`Option ${index + 1}`}
                                        variant="outlined"
                                        value={option.text}
                                        fullWidth
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

                                { selectOnly && (
                                    <Typography variant="body1">{option.text}</Typography>
                                )}
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