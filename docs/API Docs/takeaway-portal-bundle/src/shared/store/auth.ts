import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { authGuards } from '../enums/authGuardsEnum';

type jwtType = {
    atyp?: authGuards;
    iss: string;
};

type AuthStoreType = {
    isLoading: boolean;
    isAuthenticated: boolean;
    guard: authGuards;
    actions: {
        loginStarted: () => void;
        loginSuccess: (token: string, guard?: authGuards) => void;
        loginFailed: () => void;
        logoutStarted: () => void;
        logoutSuccess: () => void;
    };
};

export const useAuthStore = create<AuthStoreType>((set) => ({
    isLoading: true,
    isAuthenticated: false,
    guard: authGuards.RESTAURANT,
    actions: {
        loginStarted: () => set({ isLoading: true }),
        loginSuccess: (token, guard) => {
            try {
                const { atyp } = jwtDecode<jwtType>(token);
                set({ isLoading: false, isAuthenticated: true, guard: guard || atyp || authGuards.RESTAURANT });
            } catch (error) {
                set({ isLoading: false, isAuthenticated: false });
            }
        },
        loginFailed: () => set({ isLoading: false, isAuthenticated: false }),
        logoutStarted: () => set({ isLoading: true }),
        logoutSuccess: () => set({ isLoading: false, isAuthenticated: false })
    }
}));

/** Hooks */
export const useAuthIsLoading = () => useAuthStore((state) => state.isLoading);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useGuard = () => useAuthStore((state) => state.guard);
export const useIsChainAccount = () => useAuthStore((state) => state.guard === authGuards.CHAIN);
export const useAuthStoreActions = () => useAuthStore((state) => state.actions);
