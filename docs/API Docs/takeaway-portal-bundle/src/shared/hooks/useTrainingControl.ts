import { useEffect, useRef } from 'react';
import { TrainingControlMethods, TrainingElementId } from '../types/trainings';
import { useTrainingActions } from '../store/trainings';

const useTrainingControl = (id: TrainingElementId, methods: TrainingControlMethods) => {
    const actions = useTrainingActions();
    const methodsRef = useRef(methods);
    methodsRef.current = methods;

    useEffect(() => {
        Object.keys(methodsRef.current).forEach((name) => {
            actions.registerUIMethod(id, name, () => {
                methodsRef.current[name]?.();
            });
        });

        return () => {
            actions.clearUIMethods(id);
        };
    }, [id, actions]);
};

export default useTrainingControl;
