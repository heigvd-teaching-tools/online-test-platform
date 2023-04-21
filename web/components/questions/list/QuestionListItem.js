import {useRouter} from "next/router";
import {Box, Button, Paper, Stack, Typography, useTheme} from "@mui/material";
import QuestionTypeIcon from "../../question/QuestionTypeIcon";
import LanguageIcon from "../../question/type_specific/code/LanguageIcon";
import ContentEditor from "../../input/ContentEditor";
import DateTimeAgo from "../../feedback/DateTimeAgo";

const markdownToText = (markdown) => {
    // Replace markdown headings with an empty string
    markdown = markdown.replace(/^#+\s/gm, '');

    // Replace markdown links with the link text
    markdown = markdown.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Replace other markdown formatting with an empty string
    markdown = markdown.replace(/([*_~`])/g, '');

    // Remove leading and trailing whitespace
    markdown = markdown.trim();

    return markdown;
}

const truncateString = (str, n) => {
    if (str.length <= n) {
        return str
    }
    return str.slice(0, n) + '\n\n...'
}

const QuestionListItem = ({ question }) => {
    const router = useRouter();
    return (
        <Paper elevation={1}>
            <Stack spacing={2} p={2}>
                <Stack direction="row" justifyContent="space-between">
                    <Stack direction={"row"} spacing={1} alignItems={"center"}>
                        <QuestionTypeIcon type={question.type} size={32} />
                        {
                            question.title && question.title.length > 0 ? (
                                <Typography variant="body1">{question.title}</Typography>
                            ) : (
                                <Typography variant="body1" sx={{ color: 'error.main' }}>{`{missing title}`}</Typography>
                            )
                        }
                    </Stack>
                    {question.type === 'code' && question.code?.language && (
                        <LanguageIcon language={question.code?.language} size={22} />
                    )}
                </Stack>
                <Typography variant="body2">
                    { question.content && question.content.length > 0 && (
                        <ContentEditor
                            id={'questions-content-' + question.id}
                            readOnly
                            rawContent={truncateString(markdownToText(question.content), 500)}
                        />
                    )}
                    { !question.content || question.content.length === 0 && (
                        <Typography variant="caption">No content</Typography>
                    )}

                </Typography>

                <Stack justifyContent={"space-between"} alignItems={"center"} direction={"row"} width="100%">
                    <Button onClick={async () => {
                        await router.push(`/questions/${question.id}`);
                    }} variant={"text"}>Update</Button>
                    <Box>
                        <Stack direction={"row"} alignItems={"center"} sx={{ color: 'info.main' }}>
                            <Typography variant={"caption"}>Updated:</Typography>
                            <DateTimeAgo date={new Date(question.createdAt)} />
                        </Stack>
                    </Box>
                </Stack>
            </Stack>
        </Paper>
    );
}

export default QuestionListItem;
