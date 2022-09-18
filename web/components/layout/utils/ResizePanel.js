import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import * as resizePanelStyles from './ResizePanel.module.css';

const ResizePanel = ({
    leftPanel, rightPanel, rightWidth
}) => {
    const container = useRef(null);
    const separator = useRef(null);

    const [drag, setDrag] = useState(false);
    const [width, setWidth] = useState(rightWidth);

    useEffect(() => setWidth(rightWidth), [rightWidth]);

    const handleDrag = useCallback((state) => setDrag(state), [setDrag]);

    const handleMouseMove = useCallback((ev) => {
        if (drag) {
            const bounds = container.current.getBoundingClientRect();
            const totalWidth = bounds.width;
            const partialWidth = ev.clientX - bounds.left;
            const widthPercentage = 100 - (100 * partialWidth) / totalWidth;
            // panel min width in css
            setWidth(widthPercentage);            
        }
    }, [drag, container, setWidth]);
    return useMemo(() => (
        <div className={resizePanelStyles.resizePanelContainer} data-testid="resize-panel" ref={container}>
            <div className={`${resizePanelStyles.panelResizable} ${width === 100 ? ` ${resizePanelStyles.magnetic}` : ''}`} style={{ maxWidth: `${100 - width}%`, width: `${100 - width}%` }}>
                {leftPanel}
            </div>
            <div className={resizePanelStyles.panelSeparator}>
                <div
                    ref={separator}
                    className={resizePanelStyles.panelDragHandle}
                    role="button"
                    tabIndex={0}
                    label="drag handle"
                    onMouseMove={(ev) => handleMouseMove(ev)}
                    onMouseDown={() => handleDrag(true)}
                    onMouseUp={() => handleDrag(false)}
                />
                <div className={resizePanelStyles.panelHandle} />
            </div>
            <div className={`${resizePanelStyles.panelResizable} ${width === 0 ? ` ${resizePanelStyles.magnetic}` : ''}`} style={{ maxWidth: `${width}%`, width: `${width}%` }}>
                {rightPanel}
            </div>
        </div>), [
        container, leftPanel, separator, rightPanel, width, handleMouseMove, handleDrag
    ]);
};

ResizePanel.defaultProps = {
    rightWidth: 60
};

ResizePanel.propTypes = {
    leftPannel: PropTypes.element.isRequired,
    rightPannel: PropTypes.element.isRequired,
    rightWidth: PropTypes.number
};

export default ResizePanel;
