import Image from "next/image";
import {Box} from "@mui/material";

const QuestionTypeIcon = ({ type, size = 32 }) => {
    return(
        <Box sx={{ width:size, height:size }}>
            <Image alt="Question Type Icon" src={`/svg/questions/${type}.svg`} layout="responsive" width="52px" height="52px" priority="1" />
        </Box>
    )
}

export default QuestionTypeIcon;
