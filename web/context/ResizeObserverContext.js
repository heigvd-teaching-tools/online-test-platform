import React, { createContext, useContext, useEffect, useRef } from "react";

const ResizeObserverContext = createContext({});
export const ResizeObserverProvider = ({ children }) => {
    const container = useRef();
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    const resizeObserver = useRef(new ResizeObserver(entries => {
        const { height, width } = entries[0].contentRect;
        setDimensions({ height, width });
    }));

    useEffect(() => {
        const element = container.current;
        const observer = resizeObserver.current;
        observer.observe(element);

        // Remove event listener on cleanup
        return () => observer.unobserve(element);
    }, [resizeObserver, container]);

    return (
        <div ref={container} style={{ position:'relative', height:'100%', width:'100%', overflow:'hidden' }}>
            { /* make sure that the ResizeObserver can change sizes in all directions -> children should always overflow for height and width to decrease */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
                <ResizeObserverContext.Provider value={{ height: dimensions.height, width: dimensions.width }}>
                    {children}
                </ResizeObserverContext.Provider>
            </div>
        </div>
    );
}

export const useResizeObserver = () => useContext(ResizeObserverContext);

function ChildComponent() {
    const dimensions = useResizeObserver();

    return (
        <div>
            <p>Width: {dimensions.width}</p>
            <p>Height: {dimensions.height}</p>
        </div>
    );
}

function ParentComponent() {
    return (
        <ResizeObserverProvider>
            <div>
                <ChildComponent />
                <ResizeObserverProvider>
                    <ChildComponent />
                </ResizeObserverProvider>
            </div>
        </ResizeObserverProvider>
    );
}
