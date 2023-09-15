import {useCallback, useEffect, useState} from "react";
import {Box, Collapse, IconButton, Stack, useTheme} from "@mui/material";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
const BottomPanel = ({ header, open, onChange, children }) => {
    /*
        Must be placed in a parent with position: relative
        open and onChange are optional, if not provided the panel will be uncontrolled
    * */
    const theme = useTheme();
    const [isPanelOpen, setIsPanelOpen] = useState(open);

    useEffect(() => {
        // gives the parent a chance to set the open state, usefull for controlled mode
        setIsPanelOpen(prevState => open !== undefined ? open : prevState);
    }, [open]);

    const toggleOpen = useCallback(() => {
        setIsPanelOpen(!isPanelOpen)
        onChange && onChange(!isPanelOpen)
    }, [isPanelOpen, onChange])

    return(
        <Stack position={"absolute"} bottom={0} left={0} right={0} zIndex={2} bgcolor={theme.palette.grey["50"]} maxHeight="100%" overflow="auto" borderTop={`1px solid ${theme.palette.divider}`}>
            <Stack onClick={toggleOpen} direction={'row'} spacing={1} alignItems={"center"} justifyContent={"space-between"} width={"100%"}>
                <Box onClick={(e) => e.stopPropagation()}>
                    {header}
                </Box>
                <IconButton
                    size={"small"}
                    onClick={toggleOpen}
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
