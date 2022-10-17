import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import * as resizePanelStyles from './ResizePanel.module.css';

const ResizePanel3C = ({
    leftPanel, centerPanel, rightPanel, height = '100%'
}) => {
    const container = useRef(null);
    const separator = useRef(null);

    const [drag, setDrag] = useState(undefined);
    const [width, setWidth] = useState({
        left: 33,
        center: 33,
        right: 33
    });

    const handleDrag = useCallback((state) => setDrag(state), [setDrag]);

    const handleMouseMove = useCallback((ev) => {

        if (drag) {
            const bounds = container.current.getBoundingClientRect();
            const totalWidth = bounds.width;

            switch (drag) {
                case 'left': {
                    const partialWidth = ev.clientX - bounds.left;
                    const widthPercentage = 100 * partialWidth / totalWidth;
                    // panel min width in css
                    setWidth({
                        left: widthPercentage,
                        center: 100 - widthPercentage - width.right,
                        right: width.right
                    });
                    break;
                }
                case 'center': {
                    const partialWidth = ev.clientX - bounds.left;
                    const widthPercentage = 100 * partialWidth / totalWidth;
                    // panel min width in css
                    setWidth({
                        left: width.left,
                        center: widthPercentage - width.left,
                        right: 100 - widthPercentage
                    });
                    break;
                }
                default:
                    break;

            }
        }
    }, [drag, container, setWidth]);
    return useMemo(() => (
        <div className={resizePanelStyles.resizePanelContainer} style={{ height }} data-testid="resize-panel" ref={container}>
            <div
                className={`${resizePanelStyles.panelResizable} ${width.left === 100 ? ` ${resizePanelStyles.magnetic}` : ''}`}
                style={{ maxWidth: `${width.left}%`, width: `${width.left}%` }}
            >
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
                    onMouseDown={() => handleDrag('left')}
                    onMouseUp={() => handleDrag(undefined)}
                />
                <div className={resizePanelStyles.panelHandle} />
            </div>
            <div
                className={`${resizePanelStyles.panelResizable} ${width.center === 0 ? ` ${resizePanelStyles.magnetic}` : ''}`} style={{ maxWidth: `${width.center}%`, width: `${width.center}%` }}>
                {centerPanel}
            </div>
            <div className={resizePanelStyles.panelSeparator}>
                <div
                    ref={separator}
                    className={resizePanelStyles.panelDragHandle}
                    role="button"
                    tabIndex={0}
                    label="drag handle"
                    onMouseMove={(ev) => handleMouseMove(ev)}
                    onMouseDown={() => handleDrag('center')}
                    onMouseUp={() => handleDrag(undefined)}
                />
                <div className={resizePanelStyles.panelHandle} />
            </div>
            <div
                className={`${resizePanelStyles.panelResizable} ${width.right === 0 ? ` ${resizePanelStyles.magnetic}` : ''}`} style={{ maxWidth: `${width.right}%`, width: `${width.right}%` }}>
                {rightPanel}
            </div>
        </div>), [
        container, leftPanel, separator, rightPanel, width, height, handleMouseMove, handleDrag
    ]);
};

ResizePanel3C.defaultProps = {
    rightWidth: 50
};

ResizePanel3C.propTypes = {
    leftPannel: PropTypes.element.isRequired,
    rightPannel: PropTypes.element.isRequired,
    rightWidth: PropTypes.number
};

export default ResizePanel3C;
