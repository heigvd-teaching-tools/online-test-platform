import React, { useState, useEffect } from 'react';
import { TextField } from "@mui/material";

const Essay = ({ label, content:initial, onChange }) => {
    
    const [content, setContent] = useState();
    
    useEffect(() => {
        setContent(initial);
    }, [initial]);

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