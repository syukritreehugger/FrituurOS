import { getNotificationMessage } from '../../../helpers/notification/notificationMessageBuilder';
import { Notification } from '../../../types/notificationType';
import { markNotificationAsReadApi } from '../../../api/notifications';
import { showInfoToast } from '../../toaster';
import { isProduction } from '../../../helpers/isProduction';
import { updateNotificationInNotificationsQuery } from '../../query';

export default (notification: Notification<any>): void => {
    const message = getNotificationMessage(notification);

    updateNotificationInNotificationsQuery(notification);

    const onClose = () =>
        markNotificationAsReadApi(notification.id)
            .then((newNotification) => updateNotificationInNotificationsQuery(newNotification))
            .catch((error) => !isProduction() && console.error(error));

    showInfoToast(message, { onClose });
};
