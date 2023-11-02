import React, { useCallback, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { InputAdornment, Typography } from '@mui/material';

// Regular expression to allow only numbers with up to 2 decimal places
const regex = /^-?(\d+\.?\d{0,2}|\.\d{0,2})$/;

const DecimalInput = ({ value: initial, onChange, min = 0, max = Infinity, rightAdornement, ...props }) => {
  const [ value, setValue ] = useState(initial);
  const [ errorMessage, setErrorMessage] = useState();

  useEffect(() => {
    setValue(initial)
  }, [initial]);

  const handleChange = useCallback((e) => {
    const inputValue = e.target.value;
    setErrorMessage(undefined);
    // replace comma with dot
    setValue(inputValue.replace(',', '.'));  // Update the state with whatever user types

    // Test the input value format
    if (inputValue === '' || !regex.test(inputValue) || inputValue[inputValue.length - 1] === '.') {
        setErrorMessage("Not a valid number");
        return;
    }
   
    const floatValue = parseFloat(inputValue);

    // Value must be convertable to a float
    if (isNaN(floatValue)) {
        setErrorMessage("Not a valid number");
        return;
    }    

    // Value must be between min and max
    if(floatValue < min ) {
        floatValue = min;     
        setValue(floatValue); 
        onChange(floatValue); 
        return;
    }

    if(floatValue > max ) {
        floatValue = max;
        setValue(floatValue); 
        onChange(floatValue); 
        return;
    }

    onChange(floatValue);
    

  }, [min, max, onChange]);

  return (
    <TextField
        value={value}
        onChange={handleChange}
        type="text"
        error={errorMessage}  // Display error if hasError is true
        helperText={errorMessage}
        InputProps={{
            inputMode: 'numeric',
            pattern: '^\\d*(\\.\\d{0,2})?$',
            endAdornment: <InputAdornment position="end"><Typography variant={"caption"}>{rightAdornement}</Typography></InputAdornment>,
        }}            
        {...props}
    />
  );
}

export default DecimalInput;
