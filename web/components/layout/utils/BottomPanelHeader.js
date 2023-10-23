import { Box, Button, Stack } from "@mui/material"
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useBottomPanel } from "../../../context/BottomPanelContext";
import { useTheme } from "@emotion/react";

const BottomPanelHeader = ({ children, ...props }) => {

    const theme = useTheme();

    const { isPanelOpen, toggleOpen } = useBottomPanel();

    return (
        <Stack onClick={toggleOpen} direction={'row'} spacing={1} alignItems={"center"} justifyContent={"space-between"} width={"100%"} pr={1}  borderTop={`1px solid ${theme.palette.divider}`} {...props}>
            <Box onClick={(e) => e.stopPropagation()}>
                <Stack direction="row" alignItems="center" spacing={1} p={1} pb={2} pt={2}>
                    {children}
                </Stack>
            </Box>
            <Button
                size={"small"}
                onClick={toggleOpen}
                endIcon={isPanelOpen ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
            >
                {isPanelOpen ? 'Hide' : 'Show'}
            </Button>
        </Stack>
    )
}


export default BottomPanelHeader