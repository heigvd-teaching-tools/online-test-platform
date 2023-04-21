import { useEffect, useState, useRef } from 'react';
import {Select, InputLabel, FormControl, Typography, Box} from "@mui/material";
const DropDown = ({children, id, name, defaultValue, blurOnChange = false, minWidth = '120px', variant = "filled", size = "medium", icon, onChange}) => {
    const selectRef = useRef();

    const [value, setValue] = useState(defaultValue || '');
    const handleChange = (event) => {
        if(blurOnChange) {
            selectRef.current.blur();
        }
        setValue(event.target.value);
        onChange && onChange(event.target.value);
    }
    useEffect(() => {
        setValue(defaultValue);
        selectRef.current.value = defaultValue;
    } , [defaultValue]);
    return (
        <FormControl sx={{ flexGrow:1, minWidth }} variant={variant} margin="none">
            <InputLabel id={`label-${id}`}>{name}</InputLabel>
            <Select
                ref={selectRef}
                labelId={`label-${id}`}
                id={id}
                size={size}
                autoWidth
                onChange={handleChange}
                value={value}
                MenuProps={{ variant: 'selectedMenu'}}
                sx={{padding:0}}
                IconComponent={icon ? () => <Box sx={{mr:1, mt:2.5}}>{icon}</Box> : undefined}
            >
                {children}
            </Select>
        </FormControl>
    )
}

export default DropDown;
