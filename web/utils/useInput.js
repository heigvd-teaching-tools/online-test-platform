import { useState } from 'react';

/*
    input hook to be used on all input fields to keep track of state
    for example see the usage in : layout/SignInSide.js
*/

const useInput = data => {
    const [value, setValue] = useState(data);
    const [error, setError] = useState({
            error: false,
            helperText:''
    });
    
    return {
        value, 
        setValue,
        setError,
        reset: () => setValue(""),
        bind:{
            value,
            ...error,
            onChange: event => {
                setValue(event.target.value);
                setError({ error: false });
            }

        }
    }
}

export { useInput };