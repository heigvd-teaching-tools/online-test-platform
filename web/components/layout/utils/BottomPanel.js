import {useState} from "react";
import {Collapse, IconButton, Stack, useTheme} from "@mui/material";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
const BottomPanel = ({ header, children }) => {
    /*
        Must be placed in a parent with position: relative
    * */
    const theme = useTheme();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    return(
        <Stack position={"absolute"} bottom={0} left={0} right={0} zIndex={2} bgcolor={theme.palette.grey["50"]} maxHeight="100%" overflow="auto" borderTop={`1px solid ${theme.palette.divider}`}>
            <Stack onClick={() => setIsPanelOpen(!isPanelOpen)} direction={'row'} spacing={1} alignItems={"center"} justifyContent={"space-between"} width={"100%"}>
                {header}
                <IconButton
                    size={"small"}
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                >
                    {isPanelOpen ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                </IconButton>
            </Stack>
            <Collapse in={isPanelOpen}>
                {children}
            </Collapse>
        </Stack>
    )
}

export default BottomPanel
