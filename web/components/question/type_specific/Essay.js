import React, { useState, useEffect } from 'react';
import ContentEditor from '../../input/content/ContentEditor';

const Essay = ({ id = "essay", content, onChange }) => {
    return (
        <ContentEditor
            id={id}
            rawContent={content}
            onChange={(newContent) => {
                onChange(newContent === '' ? undefined : newContent);
            }}
        />
        
    )
    
}

export default Essay;