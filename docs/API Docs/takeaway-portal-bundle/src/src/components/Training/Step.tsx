import React, { useEffect, useRef, useState } from 'react';
import { Spinner } from '@jet-pie/react';
import useStepElement from './hooks/useStepElement';
import TrainingOverlay from './TrainingOverlay/TrainingOverlay';
import TrainingCard from './TrainingCard/TrainingCard';
import { TrainingStep } from '@lo/shared/types/trainings';
import useTrainingFlow from './hooks/useTrainingFlow';
import classes from './TrainingCard/TrainingCard.module.scss';

type StepProps = {
    data: TrainingStep;
};

const Step: React.FC<StepProps> = ({ data }) => {
    const { element, status } = useStepElement(data.elementId);
    const { completeStep, previousStep, skipStep } = useTrainingFlow(data);
    const [showSpinner, setShowSpinner] = useState(false);
    const onElementFoundRef = useRef(data.onElementFound);
    onElementFoundRef.current = data.onElementFound;

    useEffect(() => {
        if (status === 'timeout') {
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`[Training] element "${data.elementId}" not found for step "${data.id}", skipping`);
            }
            skipStep();
        } else if (status === 'found') {
            onElementFoundRef.current?.();
        }
    }, [status]);

    useEffect(() => {
        if (status !== 'searching') {
            setShowSpinner(false);
            return;
        }

        const timer = setTimeout(() => setShowSpinner(true), 300);
        return () => clearTimeout(timer);
    }, [status]);

    if (status === 'searching' && data.elementId) {
        return (
            <>
                <TrainingOverlay step={data} element={null} />
                {showSpinner && (
                    <div className={classes.spinner} aria-busy="true">
                        <Spinner size="XL" variant="inverse" />
                    </div>
                )}
            </>
        );
    }

    if (status === 'timeout') {
        return null;
    }

    return (
        <>
            <TrainingOverlay step={data} element={element} />
            <TrainingCard step={data} element={element} isVisible onComplete={completeStep} onPrevious={previousStep} />
        </>
    );
};

export default Step;
