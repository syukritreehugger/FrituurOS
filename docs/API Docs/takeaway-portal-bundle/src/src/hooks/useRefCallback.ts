import { useState, useCallback } from 'react';

export const useRefCallback = (): [HTMLElement | null, (node: HTMLElement | null) => void] => {
    const [element, setElement] = useState<HTMLElement | null>(null);

    const getElementRef = useCallback((node) => {
        setElement(node);
    }, []);

    return [element, getElementRef];
};
