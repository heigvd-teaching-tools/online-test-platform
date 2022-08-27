import { useEffect, useState } from 'react';
import { Card, Grid, Stack, TextField, Box, InputAdornment, Checkbox, IconButton, ToggleButton, Fab, Button  } from "@mui/material"

import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';

const MuiltipleChoice = ({options:initial}) => {

    const [options, setOptions] = useState(initial);

    useEffect(() => {
        if(!options || options.length < 2){
            setOptions([
                {
                    text: 'Option 1',
                    isCorrect: true
                },
                {
                    text: 'Option 2',
                    isCorrect: false
                }
            ]);
        }
    }, [options, setOptions]);

    return(
        <Stack direction="column" spacing={1} alignItems="flex-start">
            <Button color="primary" startIcon={<AddIcon />} onClick={() => setOptions([...options, {text: `Option ${options.length + 1}`, isCorrect: false}])}>
                Add Option
            </Button>
            <Grid container display="grid" rowSpacing={2} gridTemplateColumns={"repeat(2, 1fr)"}>
                {options && options.map((option, index) =>
                    <Grid item key={index}>
                        <Stack direction="row" spacing={1}>
                            <ToggleButton
                                    value="correct"
                                    selected={option.isCorrect}
                                    color='success'
                                    onChange={(e) => {
                                        const newOptions = [...options];
                                        newOptions[index].isCorrect = !newOptions[index].isCorrect;
                                        setOptions(newOptions);
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
                                    } }
                                />
                                <IconButton variant="small" onClick={() => {
                                    let newOptions = [...options];
                                    newOptions.splice(index, 1);
                                    setOptions(newOptions);
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