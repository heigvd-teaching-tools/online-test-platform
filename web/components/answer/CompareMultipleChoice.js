import {Box, Stack, Typography} from "@mui/material";
import RadioViewer from "../input/RadioViewer";

const CompareMultipleChoice = ({ mode, options, answer }) => {
    return (
        <Stack spacing={2} padding={2}>
            { options?.map((option, index) => (
                <Stack key={index} direction="row" alignItems="center" spacing={2} sx={{ flex:1 }}>
                    <RadioViewer mode={mode} key={index} selected={option.isCorrect} filled={answer.some((opt) => opt.id === option.id)} />
                    <Box>
                        <Typography variant="body1">{option.text}</Typography>
                    </Box>
                </Stack>
            ))}
        </Stack>
    )
}

export default CompareMultipleChoice;
