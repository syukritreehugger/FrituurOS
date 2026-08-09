import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trainingChecklist } from '../helpers/trainings';
import { trainingElements, TrainingControlMethods, TrainingElementId } from '../types/trainings';
import { OrderModel } from '../models';

type TrainingStoreType = {
    activeTrainingIndex: number;
    activeStepIndex: number;
    completedAmount: number;
    completedTrainingsIds: string[];
    isTrainingReview: boolean;
    isSectionReview: boolean;
    isTrainingActive: boolean;
    isCompleted: boolean;
    navigate: ((path: string) => void) | null;
    uiMethods: Record<TrainingElementId, TrainingControlMethods | undefined>;
    testOrder: OrderModel | null;
    testOrderDetails: OrderModel | null;
    actions: {
        completeStep: () => void;
        previousStep: () => void;
        closeTraining: () => void;
        completeTrainings: () => void;
        selectTraining: (id: string) => void;
        toggleReview: (value?: boolean) => void;
        registerUIMethod: (id: TrainingElementId, name: string, method: () => void) => void;
        clearUIMethods: (id: TrainingElementId) => void;
        callUIMethod: (id: TrainingElementId, name: string) => void;
        setTestOrder: (order: OrderModel | null) => void;
        setTestOrderDetails: (order: OrderModel | null) => void;
        setNavigate: (navigate: (path: string) => void) => void;
        resetTrainings: () => void;
        pauseTraining: () => void;
        resumeTraining: () => void;
    };
};

export const useTrainingStore = create<TrainingStoreType>()(
    persist(
        (set, get, store) => ({
            activeTrainingIndex: 0,
            activeStepIndex: 0,
            completedAmount: 0,
            isTrainingReview: false,
            isSectionReview: false,
            isTrainingActive: true,
            isCompleted: false,
            completedTrainingsIds: [],
            testOrder: null,
            testOrderDetails: null,
            navigate: null,
            uiMethods: Object.fromEntries(
                (Object.keys(trainingElements) as TrainingElementId[]).map((id) => [id, undefined])
            ) as Record<TrainingElementId, TrainingControlMethods | undefined>,
            actions: {
                completeStep: () =>
                    set((state) =>
                        getNextStepState(
                            state.activeTrainingIndex,
                            state.activeStepIndex,
                            state.completedAmount,
                            state.completedTrainingsIds
                        )
                    ),
                previousStep: () => {
                    const state = get();
                    const newState = getPreviousStepState(state.activeTrainingIndex, state.activeStepIndex);

                    set(newState);

                    if (newState.activeTrainingIndex !== undefined && state.navigate) {
                        const newTraining = trainingChecklist[newState.activeTrainingIndex];
                        if (newTraining.route) {
                            state.navigate(newTraining.route);
                        }
                    }
                },
                selectTraining: (id) => {
                    const trainingIndex = trainingChecklist.findIndex((item) => item.id === id);
                    if (trainingIndex === -1) return;

                    const training = trainingChecklist[trainingIndex];
                    const navigate = get().navigate;

                    set(() => ({
                        isTrainingActive: true,
                        isCompleted: false,
                        activeStepIndex: 0,
                        activeTrainingIndex: trainingIndex,
                        isTrainingReview: false
                    }));

                    if (training.route && navigate) {
                        navigate(training.route);
                    }
                },
                closeTraining: () =>
                    set(() => ({
                        isTrainingActive: false,
                        testOrder: null,
                        testOrderDetails: null
                    })),
                completeTrainings: () =>
                    set(() => ({
                        isCompleted: true
                    })),
                toggleReview: (value) => {
                    const { isTrainingReview, isSectionReview, activeTrainingIndex, navigate } = get();

                    if (isSectionReview) {
                        const nextIndex =
                            activeTrainingIndex + 1 === trainingChecklist.length ? activeTrainingIndex : activeTrainingIndex + 1;

                        set({
                            activeStepIndex: 0,
                            activeTrainingIndex: nextIndex,
                            isTrainingReview: false,
                            isSectionReview: false
                        });

                        const nextTraining = trainingChecklist[nextIndex];
                        if (nextTraining.route && navigate) {
                            navigate(nextTraining.route);
                        }
                        return;
                    }

                    set({ isTrainingReview: value !== undefined ? value : !isTrainingReview });
                },
                registerUIMethod: (id, name, method) =>
                    set((state) => ({
                        uiMethods: {
                            ...state.uiMethods,
                            [id]: { ...(state.uiMethods[id] || {}), [name]: method }
                        }
                    })),
                clearUIMethods: (id) =>
                    set((state) => ({
                        uiMethods: {
                            ...state.uiMethods,
                            [id]: undefined
                        }
                    })),
                callUIMethod: (id, name) => {
                    get().uiMethods[id]?.[name]?.();
                },
                setTestOrder: (order) =>
                    set(() => ({
                        testOrder: order
                    })),
                setTestOrderDetails: (order) =>
                    set(() => ({
                        testOrderDetails: order
                    })),
                setNavigate: (navigate) => set({ navigate }),
                resetTrainings: () => set(store.getInitialState()),
                pauseTraining: () => set({ isTrainingActive: false }),
                resumeTraining: () => set({ isTrainingActive: true })
            }
        }),
        {
            name: 'trainings',
            partialize: (state) => ({
                isCompleted: state.isCompleted,
                activeTrainingIndex: state.activeTrainingIndex,
                completedTrainingsIds: state.completedTrainingsIds,
                completedAmount: state.completedAmount
            })
        }
    )
);

const getNextStepState = (
    activeTrainingIndex: number,
    activeStepIndex: number,
    completedAmount: number,
    completedTrainingsIds: string[]
) => {
    const currentTraining = trainingChecklist[activeTrainingIndex];
    if (!currentTraining) {
        console.error(`Invalid training index: ${activeTrainingIndex}`);
        return {};
    }

    const nextStepIndex = activeStepIndex + 1;
    if (nextStepIndex >= currentTraining.steps.length) {
        const trainingId = currentTraining.id;
        const isCompletedAlready = completedTrainingsIds.includes(trainingId);
        return {
            isTrainingReview: true,
            isSectionReview: true,
            completedAmount: isCompletedAlready ? completedAmount : completedAmount + 1,
            completedTrainingsIds: isCompletedAlready ? completedTrainingsIds : [...completedTrainingsIds, trainingId]
        };
    }
    return { activeStepIndex: nextStepIndex };
};

const getPreviousStepState = (activeTrainingIndex: number, activeStepIndex: number) => {
    if (activeStepIndex > 0) {
        return { activeStepIndex: activeStepIndex - 1 };
    }

    if (activeTrainingIndex === 0) {
        return {};
    }

    const previousTrainingIndex = activeTrainingIndex - 1;
    const previousTraining = trainingChecklist[previousTrainingIndex];
    if (!previousTraining) {
        console.error(`Invalid training index: ${previousTrainingIndex}`);
        return {};
    }

    return {
        activeStepIndex: previousTraining.steps.length - 1,
        activeTrainingIndex: previousTrainingIndex
    };
};

export const useActiveTrainingStep = () =>
    useTrainingStore((state) =>
        state.isTrainingActive ? trainingChecklist[state.activeTrainingIndex]?.steps[state.activeStepIndex] : null
    );

export const useIsTrainingActive = () =>
    useTrainingStore(
        (state) => !state.isCompleted && state.isTrainingActive && state.completedAmount <= trainingChecklist.length
    );

export const useActiveTraining = () =>
    useTrainingStore((state) => trainingChecklist[state.activeTrainingIndex] ?? trainingChecklist[0]);

export const useTrainingToContinue = () =>
    useTrainingStore((state) => trainingChecklist.find((item) => !state.completedTrainingsIds.includes(item.id)) || null);

export const useTrainingOrderDetails = () =>
    useTrainingStore((state) => (state.isTrainingActive ? state.testOrderDetails : null));

export const useIsBackButtonVisible = () =>
    useTrainingStore((state) => !(state.activeStepIndex === 0 && state.activeTrainingIndex === 0));

export const useTrainingCompletedAmount = () => useTrainingStore((state) => state.completedAmount);
export const useCompletedTrainingsIds = () => useTrainingStore((state) => state.completedTrainingsIds);
export const useTrainingReview = () => useTrainingStore((state) => state.isTrainingReview);
export const useTrainingOrder = () => useTrainingStore((state) => state.testOrder);
export const useTrainingActions = () => useTrainingStore((state) => state.actions);
