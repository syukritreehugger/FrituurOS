import { useToasterStore } from '../../store/toaster';
import { Notification } from '../../types/notificationType';
import { getShowNotificationToast } from './toasterRegistry';

export default (notification: Notification<any>) => {
    const enabled = useToasterStore.getState().enabled;

    if (!enabled) return;

    getShowNotificationToast()?.(notification);
};
