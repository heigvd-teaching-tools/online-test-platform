import { Box, Drawer, Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";
const ResizableDrawer = ({ open, width: initial = 70, onClose, children }) => {
    const [dragging, setDragging] = useState(false);
    const [width, setWidth] = useState(initial);
    const ref = useRef(null);

    const handleMouseMove = (e) => {
        if (!dragging || !window) return;
        const newWidth = (window.innerWidth - e.clientX) / window.innerWidth * 100;
        setWidth(newWidth);
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    useEffect(() => {

        if(!document) return;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
        };

    }, [dragging, ref]);

    return (
        <Drawer
            anchor={'right'}
            open={open}
            PaperProps={{ style: { width: `${width}vw` } }}
            onClose={() => onClose()}
            ref={ref}
        >
            <Stack direction={"row"} width={"100%"} height={"100%"}>
                <Stack 
                    width={"24px"}
                    zIndex={2}
                    alignItems={"center"}
                    justifyContent={"center"}
                    sx={{ cursor: "ew-resize" }}
                    onMouseDown={(e) => setDragging(true)}
                    bgcolor={"background.default"}
                >
                    <ResizeHandleIcon />
                </Stack>
                <Stack flex={1} height={"100%"} overflow={"auto"}>
                    {children}
                </Stack>
            </Stack>
        </Drawer>
    )
}
const ResizeHandleIcon = () => {
    return (
        <svg width="10" height="48" viewBox="0 0 10 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="1" height="100" fill="gray" />
            <rect x="8" width="1" height="100" fill="gray" />
        </svg>
    )
}

export default ResizableDrawer