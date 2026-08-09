import { useState, useEffect } from 'react';

export const useIntersection = (element: Element | null, rootMargin?: string): boolean => {
    const [isVisible, setState] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setState(entry.isIntersecting);
            },
            { rootMargin }
        );

        element && observer.observe(element);

        return () => {
            element && observer.unobserve(element);
        };
    }, [element]);

    return isVisible;
};
