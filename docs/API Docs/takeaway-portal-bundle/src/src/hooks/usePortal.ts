import { ReactElement, ReactPortal, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type ReturnedFunction = (children: ReactElement) => ReactPortal | ReactElement;

export const usePortal = (portalName?: string): ReturnedFunction => {
    const parentRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!portalName) parentRef.current = document.getElementById('app');
        else if (document.getElementById(portalName)) {
            parentRef.current = document.getElementById(portalName);
        } else {
            const newPortalsContainer = document.createElement('div');
            newPortalsContainer.setAttribute('id', portalName);

            document.getElementById('app')?.appendChild(newPortalsContainer);
            parentRef.current = newPortalsContainer;
        }
    }, []);

    return (children) => (parentRef.current ? createPortal(children, parentRef.current) : children);
};
