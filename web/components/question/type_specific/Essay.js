import React, { useState, useEffect } from 'react';
import { TextField } from "@mui/material";

const Essay = ({ id = "essay", label, content:initial, onChange }) => {
    console.log("Essay", initial);
    const [content, setContent] = useState();
    
    useEffect(() => {
        console.log("initial", initial);
        setContent(initial || '');
    }, [initial, id]);

    return (
        <TextField 
            variant='standard'
            multiline
            fullWidth
            rows={15}
            label={label}
            id="essay-content"
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