import { create } from 'zustand';

type OutOfStockFilterStoreType = {
    counter: number;
    amount: number;
    isActive: boolean;
    outOfStockCategoryIds: string[];
    outOfStockProductIds: number[];
    actions: {
        toggle: (value?: boolean) => void;
        setCounter: (value: number) => void;
        setAmount: (value: number) => void;
        setOutOfStockCategoryIds: (value: string[]) => void;
        setOutOfStockProductIds: (value: number[]) => void;
    };
};

export const useOutOfStockFilterStore = create<OutOfStockFilterStoreType>((set) => ({
    counter: 0,
    amount: 0,
    isActive: false,
    outOfStockCategoryIds: [],
    outOfStockProductIds: [],
    actions: {
        toggle: (value) => set(({ isActive }) => ({ isActive: value ?? !isActive })),
        setCounter: (value) => set({ counter: value }),
        setAmount: (value) => set({ amount: value }),
        setOutOfStockCategoryIds: (value) => set({ outOfStockCategoryIds: value }),
        setOutOfStockProductIds: (value) => set({ outOfStockProductIds: value })
    }
}));

export const useOutOfStockFilterCounter = () => useOutOfStockFilterStore((state) => state.counter);
export const useOutOfStockFilterAmount = () => useOutOfStockFilterStore((state) => state.amount);
export const useOutOfStockFilterIsActive = () => useOutOfStockFilterStore((state) => state.isActive);
export const useOutOfStockCategoryIds = () => useOutOfStockFilterStore((state) => state.outOfStockCategoryIds);
export const useOutOfStockProductIds = () => useOutOfStockFilterStore((state) => state.outOfStockProductIds);
export const useOutOfStockFilterActions = () => useOutOfStockFilterStore((state) => state.actions);
