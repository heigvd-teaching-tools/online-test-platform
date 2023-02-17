import { useState, useEffect } from 'react';
import Image from 'next/image';
import ContentEditor from '../input/ContentEditor';
import { Stack, Chip, Typography } from '@mui/material';
import Column from '../layout/utils/Column';

const QuestionView = ({ question, totalPages }) => {

    return (
        <Stack spacing={2} sx={{ overflow:'auto', pl:2, pt:2, pr:1, pb:1, maxHeight:'100%' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Column width="32px"><Image alt="Loading..." src={`/svg/questions/${question.type}.svg`} layout="responsive" width="32px" height="32px" priority="1" /></Column>
                <Column right><Typography variant="body1"><b>Q{question.order + 1}</b> / {totalPages} </Typography></Column>
                <Column flexGrow={1} right><Chip color="info" label={`${question.points} pts`} /></Column>
            </Stack>
            <Stack flexGrow={1}>
                <ContentEditor
                    id={'questions-view-' + question.id}
                    readOnly={true}
                    rawContent={question.content}
                />
            </Stack>
        </Stack>
    )
}

export default QuestionView;
