import { trainingElements } from '../types/trainings';

const navigationTrainingIds: Partial<Record<string, string>> = {
    menu: trainingElements.navigationMenu,
    orderHistory: trainingElements.navigationOrderHistory
};

export const getNavigationTrainingId = (key: string): string | undefined => navigationTrainingIds[key];
