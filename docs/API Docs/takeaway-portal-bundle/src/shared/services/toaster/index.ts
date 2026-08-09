import hideToast from './hideToast';
import showToast from './showToast';
import showNotificationToast from './showNotificationToast';
import { LOToastOptions } from './types';

export { registerShowNotificationToast, registerShowToast } from './toasterRegistry';

type ShowTypedToastFunc = (message: string, options?: LOToastOptions) => void;

export const showSuccessToast: ShowTypedToastFunc = (message, options = {}): void => {
    showToast(message, { ...options, type: 'positive' });
};

export const showInfoToast: ShowTypedToastFunc = (message, options = {}): void => {
    showToast(message, { ...options, type: 'info' });
};

export const showWarningToast: ShowTypedToastFunc = (message, options = {}): void => {
    showToast(message, { ...options, type: 'warning' });
};

export const showErrorToast: ShowTypedToastFunc = (message, options = {}): void => {
    showToast(message, { ...options, type: 'error' });
};

export { hideToast, showNotificationToast };
