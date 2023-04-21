import Image from "next/image";
import {Box, Tooltip} from "@mui/material";
import types from "./types.json";
const getTooltipByType = (type) => {
    const typeObject = types.find(({value}) => value === type);
    return typeObject?.label;
}
const QuestionTypeIcon = ({ type, size = 32 }) => {
    return(
        <Tooltip title={getTooltipByType(type)} placement="top-start">
            <Box minWidth={size} minHeight={size}>
                <Image alt="Question Type Icon" src={`/svg/questions/${type}.svg`} layout="responsive" width="52px" height="52px" priority="1" />
            </Box>
        </Tooltip>
    )
}
export default QuestionTypeIcon;
