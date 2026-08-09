import { removeDeviceApi } from '../../api/devices';
import { isProduction } from '../isProduction';

export default async function disableWebPushNotifications() {
    const fcmToken = localStorage.getItem('fcmToken');

    if (!fcmToken) {
        return;
    }

    try {
        await removeDeviceApi(fcmToken);
    } catch (error) {
        !isProduction() && console.error('Failed to remove device', error);
    } finally {
        localStorage.removeItem('fcmToken');
    }
}
