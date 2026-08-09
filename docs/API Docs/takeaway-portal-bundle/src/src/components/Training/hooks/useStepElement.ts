import { useEffect, useRef, useState } from 'react';
import { getTrainingElement } from '@lo/shared/helpers/trainings';
import { ElementSearchResult } from '@lo/shared/types/trainings';

type UseStepElement = (elementId?: string) => ElementSearchResult;

const isElementVisible = (element: Element | null): boolean => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
};

const useStepElement: UseStepElement = (elementId) => {
    const [status, setStatus] = useState<ElementSearchResult['status']>('searching');
    const [element, setElement] = useState<Element | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        if (!elementId) {
            setElement(null);
            setStatus('found');
            return;
        }

        setElement(null);
        setStatus('searching');

        const cleanup = () => {
            clearTimeout(timeoutRef.current);
            observerRef.current?.disconnect();
        };

        const checkElement = () => {
            const trainingElement = getTrainingElement(elementId);
            if (trainingElement && isElementVisible(trainingElement)) {
                setElement(trainingElement);
                setStatus('found');
                cleanup();
                return true;
            }
            return false;
        };

        if (checkElement()) {
            return cleanup;
        }

        timeoutRef.current = setTimeout(() => {
            setStatus('timeout');
            observerRef.current?.disconnect();
        }, 2000);

        const root = document.getElementById('root') ?? document.body;
        observerRef.current = new MutationObserver(checkElement);
        observerRef.current.observe(root, { childList: true, subtree: true });

        return cleanup;
    }, [elementId]);

    return { element, status };
};

export default useStepElement;
