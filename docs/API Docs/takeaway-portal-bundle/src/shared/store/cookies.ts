import { create } from 'zustand';
import { getCookie, removeCookie, setCookie } from '../helpers/cookie';

type AcceptedValue = 'all' | 'necessary';
const AcceptedValues = ['all', 'necessary', null] as const;

type CookiesStoreType = {
    accepted: AcceptedValue | null;
    actions: {
        accept: (value: AcceptedValue) => void;
        reset: () => void;
    };
};

const COOKIE_KEY = 'cookiesAccepted';

const defaultAcceptedValue = (getCookie(COOKIE_KEY) ?? null) as AcceptedValue;

export const useCookiesStore = create<CookiesStoreType>((set) => ({
    accepted: AcceptedValues.includes(defaultAcceptedValue) ? defaultAcceptedValue : null,
    actions: {
        accept: (type) => {
            setCookie(COOKIE_KEY, type, {
                expires: 60 * 60 * 24 * 30 // 30 days
            });
            set({ accepted: type });
        },
        reset: () => {
            removeCookie(COOKIE_KEY);
            set({ accepted: null });
        }
    }
}));

export const useAcceptedCookies = () => useCookiesStore((state) => state.accepted);
export const useCookiesActions = () => useCookiesStore((state) => state.actions);
