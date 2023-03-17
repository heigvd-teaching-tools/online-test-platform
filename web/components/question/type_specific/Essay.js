import React from 'react';
import ContentEditor from '../../input/ContentEditor';
import {Box} from "@mui/material";

const Essay = ({ id = "essay", content, onChange }) => {
    return (
        <Box pt={2} bgcolor="white">
            <ContentEditor
                id={id}
                rawContent={content}
                onChange={(newContent) => {
                    if(newContent === content) return;
                    onChange(newContent === '' ? undefined : newContent);
                }}
            />
        </Box>
    )
}

export default Essay;
