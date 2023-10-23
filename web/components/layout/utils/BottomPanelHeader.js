import { Box, Button, Stack } from "@mui/material"
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useBottomPanel } from "../../../context/BottomPanelContext";

const BottomPanelHeader = ({ children, ...props }) => {

    const { isPanelOpen, toggleOpen } = useBottomPanel();

    return (
        <Stack onClick={toggleOpen} direction={'row'} spacing={1} alignItems={"center"} justifyContent={"space-between"} width={"100%"} {...props}>
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