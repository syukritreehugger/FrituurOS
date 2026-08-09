import { create } from 'zustand';

type ToasterStoreType = {
    enabled: boolean;
    bottomOffset: number;
    actions: {
        disableToaster: () => void;
        enableToaster: () => void;
        setToasterBottomOffset: (value: number) => void;
        resetToasterBottomOffset: () => void;
    };
};

export const useToasterStore = create<ToasterStoreType>((set) => ({
    enabled: true,
    bottomOffset: 0,
    actions: {
        disableToaster: () => set({ enabled: false }),
        enableToaster: () => set({ enabled: true }),
        setToasterBottomOffset: (value: number) => set({ bottomOffset: value }),
        resetToasterBottomOffset: () => set({ bottomOffset: 0 })
    }
}));

const useToasterIsEnabled = () => useToasterStore((state) => state.enabled);
const useToasterBottomOffset = () => useToasterStore((state) => state.bottomOffset);
const useToasterStoreActions = () => useToasterStore((state) => state.actions);

export { useToasterIsEnabled, useToasterBottomOffset, useToasterStoreActions };
