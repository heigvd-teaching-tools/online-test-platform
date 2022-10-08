import React, { useState, useEffect } from 'react';
import ContentEditor from '../../input/content/ContentEditor';

const Essay = ({ id = "essay", content:initial, onChange }) => {
    const [content, setContent] = useState();
    
    useEffect(() => {
        setContent(initial || '');
    }, [initial, id]);

    return (
        <ContentEditor
            id={id}
            rawContent={content}
            onChange={(newContent) => {
                if(newContent !== content){
                    onChange(newContent === '' ? undefined : newContent);
                }
                setContent(newContent);
            }}
        />
        
    )
    
}

export default Essay;