import { useEffect, useRef, useState } from "react";

export const useSplitter = (initialWidth = 50) => {
    const [leftWidth, setLeftWidth] = useState(initialWidth);
    const isResizing = useRef(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return;
            const width = (e.clientX / window.innerWidth) * 100;
            // constrain between 20% and 80%
            if (width > 20 && width < 80) {
                setLeftWidth(width);
            }
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.body.style.cursor = "default";
            document.body.style.userSelect = "auto";
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const startResizing = (e: React.MouseEvent) => {
        isResizing.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    };

    return { leftWidth, startResizing };
};
