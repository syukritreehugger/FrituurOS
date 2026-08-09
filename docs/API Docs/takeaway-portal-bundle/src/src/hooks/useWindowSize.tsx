import { useEffect, useState } from 'react';

type WindowSize = {
    width: number;
    height: number;
    isLessThanDesktopWidth: boolean;
    isLessThanTabletWidth: boolean;
    isTablet: boolean;
};

export const useWindowSize = (): WindowSize => {
    const desktopWidth = 1025;
    const tabletWidth = 768;

    const [windowSize, setWindowSize] = useState<WindowSize>({
        width: window.innerWidth,
        height: window.innerHeight,
        isLessThanDesktopWidth: window.innerWidth < desktopWidth,
        isLessThanTabletWidth: window.innerWidth < tabletWidth,
        isTablet: window.innerWidth < desktopWidth && !(window.innerWidth < tabletWidth)
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
                isLessThanDesktopWidth: window.innerWidth < desktopWidth,
                isLessThanTabletWidth: window.innerWidth < tabletWidth,
                isTablet: window.innerWidth < desktopWidth && !(window.innerWidth < tabletWidth)
            });
        }
        window.addEventListener('resize', handleResize);

        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};
