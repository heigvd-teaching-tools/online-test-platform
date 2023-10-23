import React, { createContext, useContext, useState, useCallback } from "react";

const BottomPanelContext = createContext();

export const useBottomPanel = () => {
    return useContext(BottomPanelContext);
};

export const BottomPanelProvider = ({ open, onChange, children }) => {
    
    const [isPanelOpen, setIsPanelOpen] = useState(open);

    const toggleOpen = useCallback(() => {
        const newIsPanelOpen = !isPanelOpen;
        setIsPanelOpen(newIsPanelOpen);
        onChange && onChange(newIsPanelOpen);
    }, [onChange, isPanelOpen]);

    const openPanel = useCallback(() => {
        if(isPanelOpen) return;
        setIsPanelOpen(true);
        onChange && onChange(true);
    }, [onChange, isPanelOpen]);

    const closePanel = useCallback(() => {
        if(!isPanelOpen) return;
        setIsPanelOpen(false);
        onChange && onChange(false);
    }, [onChange, isPanelOpen]);

    const value = {
        isPanelOpen,
        toggleOpen, 
        openPanel,
        closePanel
    };

    return (
        <BottomPanelContext.Provider value={value}>
            {children}
        </BottomPanelContext.Provider>
    );
};
