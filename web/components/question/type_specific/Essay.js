import React, { useState, useEffect } from 'react';
import { TextField } from "@mui/material";

const Essay = ({ id = "essay", label, content:initial, onChange }) => {
    const [content, setContent] = useState();
    
    useEffect(() => {
        setContent(initial || '');
    }, [initial, id]);

    return (
        <TextField 
            variant='standard'
            multiline
            fullWidth
            rows={15}
            label={label}
            id={id}
            value={content}
            onChange={(e) => {
                let newContent = e.target.value;
                if(newContent !== content){
                    onChange(newContent === '' ? undefined : newContent);
                }
                setContent(newContent);
            }}
            sx={{ p:1 }}
            
        />
    )
    
}

export default Essay;