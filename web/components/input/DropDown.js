import { useEffect, useState } from 'react';
import { Select, InputLabel, FormControl, Typography } from "@mui/material";


const DropDown = ({children, id, name, defaultValue, minWidth = '120px', onChange}) => {
    const [value, setValue] = useState(defaultValue || '');
    const handleChange = (event) => {
        setValue(event.target.value);
        onChange(event.target.value);
    }
    useEffect(() => {
        setValue(defaultValue);
    } , [defaultValue]);
    return (
        <FormControl sx={{ flexGrow:1, minWidth }} variant="filled" margin="none">
            <InputLabel id={`label-${id}`}>
                <Typography variant="body1">{name}</Typography>
            </InputLabel>
            <Select
                labelId={`label-${id}`}
                id={id}
                autoWidth
                onChange={handleChange}
                value={value}
                MenuProps={{ variant: 'selectedMenu'}}
                sx={{padding:0}} 
            >
                {children}
            </Select>
        </FormControl>
    )
}

export default DropDown;