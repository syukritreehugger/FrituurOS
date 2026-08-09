import { create } from 'zustand';

type AppStatusStore = {
    isActive: boolean;
    hasInternetConnection: boolean;
    isReconnectingSockets: boolean;
    actions: {
        setIsActive: (isActive: boolean) => void;
        setHasInternetConnection: (hasInternetConnection: boolean) => void;
        setIsReconnectingSockets: (isReconnecting: boolean) => void;
    };
};

export const useAppStatusStore = create<AppStatusStore>((set) => ({
    isActive: true,
    hasInternetConnection: true,
    isReconnectingSockets: false,
    actions: {
        setIsActive: (isActive) => set({ isActive }),
        setHasInternetConnection: (hasInternetConnection) => set({ hasInternetConnection }),
        setIsReconnectingSockets: (isReconnecting) => set({ isReconnectingSockets: isReconnecting })
    }
}));

/** Hooks */
export const useAppIsActive = () => useAppStatusStore((state) => state.isActive);
export const useAppStatusActions = () => useAppStatusStore((state) => state.actions);
export const useIsReconnectingSockets = () => useAppStatusStore((state) => state.isReconnectingSockets);
