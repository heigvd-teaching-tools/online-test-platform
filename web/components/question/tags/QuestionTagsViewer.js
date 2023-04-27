import {Box, Chip, Stack, Typography} from "@mui/material";

const QuestionTagsViewer = ({ tags = [], size = "medium" } ) =>
    <Stack direction={"row"} rowGap={1} flexWrap="wrap">
        {
        tags?.map((tag) => (
            <Chip size={size} key={tag.label} color={"info"} variant="filled" label={
                <Typography variant={"caption"}>{tag.label}</Typography>
            } sx={{ mr : 1}}  />
        ))}
    </Stack>

export default QuestionTagsViewer;
