import { useEffect, useState, useRef } from 'react';
import { Select, InputLabel, FormControl, Typography } from "@mui/material";


const DropDown = ({children, id, name, defaultValue, blurOnChange = false, minWidth = '120px', onChange}) => {
    const selectRef = useRef();
    
    const [value, setValue] = useState(defaultValue || '');
    const handleChange = (event) => {
        if(blurOnChange) {
            selectRef.current.blur();
        }
        setValue(event.target.value);
        onChange(event.target.value);
    }
    useEffect(() => {
        setValue(defaultValue);
        selectRef.current.value = defaultValue;
        console.log("defaultValue changed", defaultValue);
    } , [defaultValue]);
    return (
        <FormControl sx={{ flexGrow:1, minWidth }} variant="filled" margin="none">
            <InputLabel id={`label-${id}`}>
                <Typography variant="body1">{name}</Typography>
            </InputLabel>
            <Select
                ref={selectRef}
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