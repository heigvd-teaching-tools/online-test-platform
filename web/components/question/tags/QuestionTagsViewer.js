import {Chip, Stack, Typography} from "@mui/material";

const QuestionTagsViewer = ({ tags = [], size = "medium" } ) =>
    <Stack direction={"row"} spacing={1}>{
        tags.map((tag, index) => (
            <Chip size={size} key={tag.label} color={"info"} variant="filled" label={
                <Typography variant={"caption"}>{tag.label}</Typography>
            } />
        ))}
    </Stack>

export default QuestionTagsViewer;
