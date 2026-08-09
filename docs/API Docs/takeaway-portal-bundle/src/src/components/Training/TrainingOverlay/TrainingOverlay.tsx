import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { useTrainingActions } from '@lo/shared/store/trainings';
import { TrainingStep } from '@lo/shared/types/trainings';
import classes from './TrainingOverlay.module.scss';

type TrainingOverlayProps = {
    step: TrainingStep;
    element?: Element | null;
};

const TrainingOverlay: React.FC<TrainingOverlayProps> = (props) => {
    const { step, element } = props;
    const { toggleReview } = useTrainingActions();
    const [maskStyle, setMaskStyle] = useState<CSSProperties>();
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const computeMaskPosition = (el: Element) => {
        const elementRect = el.getBoundingClientRect();
        const radius = Math.max(elementRect.width, elementRect.height) / 2 + 20;
        const cx = elementRect.left + elementRect.width / 2;
        const cy = elementRect.top + elementRect.height / 2;

        if (radius !== undefined && cx !== undefined && cy !== undefined) {
            setMaskStyle({
                WebkitMaskImage: `radial-gradient(circle ${radius}px at ${cx}px ${cy}px, transparent 0 ${radius}px, black ${radius}px)`,
                maskImage: `radial-gradient(circle ${radius}px at ${cx}px ${cy}px, transparent 0 ${radius}px, black ${radius}px)`
            });
        } else {
            setMaskStyle(undefined);
        }
    };

    useEffect(() => {
        setMaskStyle(undefined);
    }, [step.elementId]);

    useEffect(() => {
        if (!element) {
            setMaskStyle(undefined);
            return;
        }

        computeMaskPosition(element);
        timeoutRef.current = setTimeout(() => computeMaskPosition(element), 500);

        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, [element]);

    if (!step) return null;
    return <div className={classes.overlay} style={maskStyle} onClick={() => toggleReview(false)} />;
};

export default TrainingOverlay;
