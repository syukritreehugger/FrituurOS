import { useCallback, useEffect, useRef, useState } from 'react';
import { Step } from 'intro.js-react';
import { getTutorialsConfig, type TutorialId } from '@lo/shared/helpers/tutorials';

type Tutorial = {
    id: string;
    enabled: boolean;
    steps?: Step[];
    scrollToElement?: boolean;
    getTutorialRef: (index?: string) => (node: HTMLElement | null) => void;
};

export const useTutorial = (id: TutorialId, elementRef?: HTMLElement | null): Tutorial => {
    const refs = useRef<{ [key: string]: HTMLElement | null }>({});
    const [steps, setSteps] = useState<any[]>([]);
    const elementsLoaded = !Object.values(refs.current).some((element) => !element);

    const getTutorialRef = useCallback(
        (index = 'default') =>
            (node: HTMLElement | null) => {
                refs.current[index] = node;
            },
        [elementRef]
    );

    useEffect(() => {
        const tutorialsConfig = getTutorialsConfig();
        const newSteps = Object.keys(tutorialsConfig[id]).map((key) => ({
            ...tutorialsConfig[id][key],
            element: elementRef || refs.current[key] || undefined
        }));
        setSteps(newSteps);
    }, [elementsLoaded, elementRef]);

    return { id, steps, enabled: elementsLoaded, getTutorialRef };
};
