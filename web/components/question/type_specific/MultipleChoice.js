import { useEffect, useState } from 'react';
import {  Stack, TextField, IconButton, ToggleButton, Button, Typography, Box  } from "@mui/material"

import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';

const MultipleChoice = ({ id = "multi_choice", options:initial, onChange, onAdd, onDelete, selectOnly = false}) => {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        if (initial) {
            if (initial && initial.length > 0) {
                setOptions(initial);
            }
        }

    }, [initial, id]);

    const selectOption = (index) => {
        const newOptions = [...options];
        newOptions[index].isCorrect = !newOptions[index].isCorrect;
        // must have at least one selected option
        if(!selectOnly && !newOptions.some((option) => option.isCorrect)){
            return;
        }
        setOptions(newOptions);
        onChange(index, newOptions);
    }
    return(
        <Stack id={id} direction="column" spacing={2} padding={2}>
            { !selectOnly && (
               <Box>
                   <Button color="primary" startIcon={<AddIcon />} onClick={() => onAdd()}>
                        Add Option
                    </Button>
                </Box>
            )}

            { options?.map((option, index) =>
                <Stack key={index} direction="row" alignItems="center" spacing={2} sx={{ flex:1 }}>
                    <ToggleButton
                        value="correct"
                        selected={option.isCorrect}
                        color='success'
                        onChange={(e) => selectOption(index) }
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
                            error={option.text.length === 0}
                            onChange={(e) => {
                                const newOptions = [...options];
                                newOptions[index].text = e.target.value;
                                setOptions(newOptions);
                                onChange(index, newOptions);
                            } }
                        />
                        <IconButton variant="small" color="error" onClick={() => {
                            let newOptions = [...options];
                            const deleted = options[index];
                            newOptions.splice(index, 1);
                            setOptions(newOptions);
                            onDelete(index, deleted);
                        } }>
                            <DeleteIcon />
                        </IconButton></>
                    )}

                    { selectOnly && (
                        <Typography variant="body1">{option.text}</Typography>
                    )}
                </Stack>
            )}
        </Stack>
    )
}

export default MultipleChoice;
