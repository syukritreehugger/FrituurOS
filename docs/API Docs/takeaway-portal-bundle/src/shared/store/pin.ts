import { create } from 'zustand';
import SecureStorage from '../services/storage/secure';

export enum PinAction {
    ENABLE,
    DISABLE,
    UPDATE,
    CHECK
}

type PinStoreType = {
    currentAction?: PinAction;
    popupIsOpen: boolean;
    popupIsClosing: boolean;
    onDismiss?: () => void;
    isLoading: boolean;
    failed: boolean;
    token: string | null;
    actions: {
        openPopup: ({ action, onDismiss }: { action: PinAction; onDismiss?: () => void }) => void;
        requestStarted: () => void;
        requestFailed: () => void;
        setToken: (token: string | null) => Promise<void>;
        closingPopupStarted: () => void;
        popupIsClosed: () => void;
    };
};

export const usePinStore = create<PinStoreType>((set) => ({
    currentAction: undefined,
    popupIsOpen: false,
    popupIsClosing: false,
    onDismiss: undefined,
    isLoading: true,
    failed: false,
    isWaitingForSocketUpdateEvent: false,
    token: null,
    actions: {
        openPopup: ({ action, onDismiss }) => {
            set({ currentAction: action, popupIsOpen: true, onDismiss });
        },
        requestStarted: () => set({ isLoading: true, failed: false }),
        requestFailed: () => set({ isLoading: false, failed: true }),
        setToken: async (token) => {
            if (token) {
                await SecureStorage.setItem('pinToken', token);
            } else {
                await SecureStorage.removeItem('pinToken');
            }

            set({ token, isLoading: false });
        },
        closingPopupStarted: () => {
            set({ popupIsClosing: true, currentAction: undefined, isLoading: false, failed: false, onDismiss: undefined });
        },
        popupIsClosed: () => set({ popupIsOpen: false, popupIsClosing: false })
    }
}));

// Set the token from storage on app load
SecureStorage.getItem('pinToken').then((token) => usePinStore.getState().actions.setToken(token));

/** Hooks */

export const usePinPopupIsOpen = () => usePinStore((state) => state.popupIsOpen);

export const usePinPopupIsClosing = () => usePinStore((state) => state.popupIsClosing);

export const usePinIsLoading = () => usePinStore((state) => state.isLoading);

export const usePinToken = () => usePinStore((state) => state.token);

export const usePinStoreActions = () => usePinStore((state) => state.actions);
