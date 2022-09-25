import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Editor, EditorState, convertFromRaw } from "draft-js";
import { Stack, Chip, Typography } from '@mui/material';
import Column from '../../layout/utils/Column';

const QuestionView = ({ question, page, totalPages }) => {
    const [ editorState, setEditorState ] = useState(EditorState.createEmpty());
   
    useEffect(() => {
        if (question.content) {
            const contentState = convertFromRaw(JSON.parse(question.content));
            setEditorState(EditorState.createWithContent(contentState));
        }
    }, [question.content]);
   
    return (
        <Stack spacing={2} sx={{ overflow:'auto', pl:2, pt:2, pr:1, pb:1, maxHeight:'100%' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Column width="32px"><Image alt="Loading..." src={`/svg/questions/${question.type}.svg`} layout="responsive" width="32px" height="32px" priority="1" /></Column>
                <Column right><Typography variant="body1"><b>Q{page}</b> / {totalPages} </Typography></Column>
                <Column flexGrow={1} right><Chip color="info" label={`${question.points} pts`} /></Column>
            </Stack>
            <Stack flexGrow={1}>
                <Editor 
                    readOnly={true} 
                    editorState={editorState} 
                />
            </Stack>            
        </Stack>
    )
}

export default QuestionView;