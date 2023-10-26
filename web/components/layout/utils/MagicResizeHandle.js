import { Stack } from "@mui/material";
import { useEffect, useRef } from "react";

const disableIframePointerEvents = () => {
    // Disable pointer events on all iframes when dragging starts
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => iframe.style.pointerEvents = 'none');
}

const enableIframePointerEvents = () => {
    // Re-enable pointer events on all iframes when dragging stops
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => iframe.style.pointerEvents = 'auto');
}

const MagicResizeHandle = ({ width = 50 }) => {
    const handleRef = useRef(null);

    useEffect(() => {
        const rightSibling = handleRef.current?.nextElementSibling;
        const parentElement = handleRef.current?.parentElement;

        if (rightSibling) {
            rightSibling.style.width = `${width}%`;
        }

        let isDragging = false;
        let initialX = 0;
        let initialRightPercentage = width;

        const handleMouseMove = (moveEvent) => {
            if (!isDragging) return;

            const deltaX = initialX - moveEvent.clientX;
            const parentWidth = parentElement.offsetWidth;
            const deltaPercentage = (deltaX / parentWidth) * 100;
            const newPercentage = Math.max(0, initialRightPercentage + deltaPercentage);

            if (rightSibling) {
                rightSibling.style.width = `${newPercentage}%`;
            }
        };

        const handleMouseDown = (e) => {
            isDragging = true;
            initialX = e.clientX;

            if (rightSibling) {
                const parentWidth = parentElement.offsetWidth;
                initialRightPercentage = (rightSibling.offsetWidth / parentWidth) * 100;
            }

            if(!document) return;

            // Disable pointer events on all iframes when dragging starts
            disableIframePointerEvents();
            // Add mousemove and mouseup listeners to the parent on mousedown
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

        const handleMouseUp = () => {
            isDragging = false;
            if(!document) return;

            // Re-enable pointer events on all iframes when dragging stops
            enableIframePointerEvents();
            // Remove the mousemove and mouseup listeners from the parent on mouseup
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        // Add the mousedown listener to the handle
        handleRef.current.addEventListener('mousedown', handleMouseDown);

        return () => {
            // Clean up all the listeners on unmount
            if (handleRef.current) {
                handleRef.current.removeEventListener('mousedown', handleMouseDown);
            }
            if (document) {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
        };
    }, [width]);

    return (
        <Stack justifyContent={"center"} sx={{ cursor: 'ew-resize' }} ref={handleRef} pr={0.5} pl={0.5}>
            <ResizeHandleIcon />
        </Stack>
    );
}

const ResizeHandleIcon = () => {
    return (
        <svg width="10" height="48" viewBox="0 0 10 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="1" height="100" fill="gray" />
            <rect x="8" width="1" height="100" fill="gray" />
        </svg>
    )
}

export default MagicResizeHandle;
