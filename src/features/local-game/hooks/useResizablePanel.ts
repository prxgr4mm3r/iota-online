'use client';
import { useState, useCallback, useEffect } from 'react';

export function useResizablePanel(initialWidth: number = 300) {
    const [handWidth, setHandWidth] = useState(initialWidth);
    const [isResizing, setIsResizing] = useState(false);

    const handleMouseDown = useCallback(() => {
        setIsResizing(true);
    }, []);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = window.innerWidth - e.clientX;
            setHandWidth(Math.max(250, Math.min(600, newWidth)));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    return { handWidth, isResizing, handleMouseDown };
}
