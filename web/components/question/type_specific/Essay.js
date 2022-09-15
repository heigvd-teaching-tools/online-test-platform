import React, { useEffect } from 'react';
import { TextField } from "@mui/material";

import { useInput } from '../../../utils/useInput';

const Essay = ({ label, content:initial, onChange }) => {
    
    const { value:content, bind:bindContent } = useInput(initial || '');
    
    useEffect(() => {
        if(content !== initial){
            onChange(content === '' ? undefined : content);
        }
    }, [content]);

    return (
        <TextField 
            variant='standard'
            multiline
            fullWidth
            rows={15}
            label={label}
            id="essay-content"
            value={content}
            sx={{ p:1 }}
            {...bindContent}
        />
    )
    
}

export default Essay;