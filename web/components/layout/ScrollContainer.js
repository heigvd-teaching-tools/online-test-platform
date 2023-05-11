import { Stack} from "@mui/material";
import {forwardRef} from "react";

/*
Fill the parent container with a scrollable container.
Use absolute positioning to get the children out of the flow of the parent container,
insuring the children do not affect the size of the parent container.

The parent container must have a height and width set.
*/

const ScrollContainer = forwardRef(({ children, spacing = 0, padding = 0 }, ref) => {
    return (
        <Stack ref={ref} position={"relative"} flex={1} overflow={"auto"} height={"100%"} width={"100%"}>
            <Stack position={"absolute"} top={0} left={0} bottom={0} right={0} spacing={spacing} padding={padding}>
                {children}
            </Stack>
        </Stack>
    )
});

ScrollContainer.displayName = 'ScrollContainer';
export default ScrollContainer;
