import axios from '@lo/shared/ajax/axiosSetup';
import { Notification } from '../types/notificationType';

export function getNotificationsApi(): Promise<Notification[]> {
    return axios({
        url: `/notifications`,
        method: 'get'
    }).then((response) => response.data);
}

export function markNotificationsAsReadApi(): Promise<Notification[]> {
    return axios({
        url: `/notifications/read-all`,
        method: 'post'
    }).then((response) => response.data);
}

export function markNotificationAsReadApi(notificationId: Notification['id']): Promise<Notification> {
    return axios({
        url: `/notifications/${notificationId}/read`,
        method: 'post'
    }).then((response) => response.data);
}
