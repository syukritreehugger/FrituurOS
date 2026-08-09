import { useTrainingActions } from '@lo/shared/store/trainings';
import { TrainingStep } from '@lo/shared/types/trainings';
import { useEffect, useRef } from 'react';

type UseTrainingFlow = (step: TrainingStep) => {
    completeStep: () => void;
    previousStep: () => void;
    skipStep: () => void;
};

const useTrainingFlow: UseTrainingFlow = (step) => {
    const trainingActions = useTrainingActions();
    const stepRef = useRef(step);
    stepRef.current = step;

    useEffect(() => {
        stepRef.current.onStart?.();
    }, [step.id]);

    const completeStep = () => {
        step.onComplete?.();
        trainingActions.completeStep();
    };

    const previousStep = () => {
        step.onBack?.();
        trainingActions.previousStep();
    };

    const skipStep = () => {
        trainingActions.completeStep();
    };

    return { completeStep, previousStep, skipStep };
};

export default useTrainingFlow;
