import Image from 'next/image';
import ContentEditor from '../input/ContentEditor';
import { Stack, Chip, Typography } from '@mui/material';
import Column from '../layout/utils/Column';
import ScrollContainer from "../layout/ScrollContainer";

const QuestionView = ({ order, points, question, totalPages }) => {

    return (
        <Stack height={"100%"} width={"100%"} spacing={2} overflow={"auto"} pl={2} pt={2} pr={1} pb={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Column width="32px"><Image alt="Loading..." src={`/svg/questions/${question.type}.svg`} layout="responsive" width="32px" height="32px" priority="1" /></Column>
                <Column right><Typography variant="body1"><b>Q{order + 1}</b> / {totalPages} </Typography></Column>
                <Column flexGrow={1} right><Chip color="info" label={`${points} pts`} /></Column>
            </Stack>
            <Stack flex={1} >
                <ScrollContainer>
                    <ContentEditor
                        id={'questions-view-' + question.id}
                        readOnly
                        rawContent={question.content}
                    />
                </ScrollContainer>
            </Stack>
        </Stack>
    )
}

export default QuestionView;
