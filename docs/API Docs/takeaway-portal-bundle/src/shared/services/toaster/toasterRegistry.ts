import { Notification } from '../../types/notificationType';
import { LOToastOptions } from './types';

type ShowNotificationToastFn = (notification: Notification<any>) => void;
type ShowToastFn = (message: string, options: LOToastOptions) => void;

let _showNotificationToast: ShowNotificationToastFn | null = null;
let _showToast: ShowToastFn | null = null;

export const registerShowNotificationToast = (fn: ShowNotificationToastFn) => {
    _showNotificationToast = fn;
};

export const registerShowToast = (fn: ShowToastFn) => {
    _showToast = fn;
};

export const getShowNotificationToast = (): ShowNotificationToastFn | null => _showNotificationToast;
export const getShowToast = (): ShowToastFn | null => _showToast;
