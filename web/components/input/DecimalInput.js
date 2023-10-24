import React, { useCallback, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { Box, IconButton, InputAdornment, Stack, Tooltip, Typography } from '@mui/material';

// Regular expression to allow only numbers with up to 2 decimal places
const regex = /^-?(\d+\.?\d{0,2}|\.\d{0,2})$/;


const DecimalInput = ({ value: initial, onChange, min = 0, max = Infinity, step = 1, rightAdornement, ...props }) => {
  const [ value, setValue ] = useState(initial);
  const [ errorMessage, setErrorMessage] = useState();

  useEffect(() => {
    setValue(initial)
  }, [initial]);

  const handleChange = useCallback((e) => {
    const inputValue = e.target.value;
    setErrorMessage(undefined);
    setValue(inputValue);  // Update the state with whatever user types

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
    
    // check if the value is a multiple of the step
    const remainder = (floatValue * 100) % (step * 100);
    if (remainder === 0) {
        setErrorMessage(undefined);
        onChange(floatValue);  
    } else {
        setErrorMessage(`Not an increment of ${step}`);
    }

  }, [min, max, step, onChange]);

  const incrementValue = () => {
    const newValue = Math.min(parseFloat(value || 0) + step, max);
    setValue(newValue);
    onChange(newValue);
  };

  const decrementValue = () => {
    const newValue = Math.max(parseFloat(value || 0) - step, min);
    setValue(newValue);
    onChange(newValue);
  };

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
            endAdornment:(
                <InputAdornment position="end">
                    <Stack alignItems={"center"} spacing={0.3}>
                        <Box onClick={incrementValue} style={{cursor: 'pointer'}} width={14} height={20} p={0.2}>
                            <svg width="10" height="6" viewBox="0 0 12 6" fill="none" >
                                <path d="M1 5L6 1L11 5" stroke="green"/>
                            </svg>
                        </Box>
                        <Box onClick={decrementValue} style={{cursor: 'pointer'}} width={14} height={20} p={0.2}>
                            <svg width="10" height="6" viewBox="0 0 12 6" fill="none" style={{verticalAlign: 'top'}}>
                                <path d="M1 1L6 5L11 1" stroke="red"/>
                            </svg>
                        </Box>
                    </Stack>
                { rightAdornement && (
                    <Stack ml={0.5} alignItems={"center"}>
                    <Typography variant="caption" color="textSecondary">
                        {rightAdornement}
                    </Typography>
                    </Stack>
                )}    
                </InputAdornment>
              ),
            step,
        }}
        {...props}
    />
  );
}

export default DecimalInput;
