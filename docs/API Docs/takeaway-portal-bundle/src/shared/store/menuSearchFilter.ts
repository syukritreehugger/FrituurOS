import { create } from 'zustand';

export type MenuSearchResult = { id: string; code?: string; name: string };

type SearchFilterStoreType = {
    value: string;
    results: MenuSearchResult[];
    isActive: boolean;
    actions: {
        clear: () => void;
        apply: (value?: string) => void;
        update: (value: string) => void;
        setResults: (results: MenuSearchResult[]) => void;
    };
};

export const useSearchFilterStore = create<SearchFilterStoreType>((set) => ({
    value: '',
    results: [],
    isActive: false,
    actions: {
        clear: () => set({ value: '', isActive: false }),
        apply: (value) => set(({ value: currentValue }) => ({ value: value || currentValue, isActive: true })),
        update: (value) => set({ value, isActive: false }),
        setResults: (results) => set({ results })
    }
}));

export const useSearchFilterValue = () => useSearchFilterStore((state) => state.value);
export const useSearchFilterResults = () => useSearchFilterStore((state) => state.results);
export const useSearchFilterIsActive = () => useSearchFilterStore((state) => state.isActive);
export const useSearchFilterActions = () => useSearchFilterStore((state) => state.actions);
