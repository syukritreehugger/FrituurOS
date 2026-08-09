import { create } from 'zustand';
import { Notification } from '../types/notificationType';
import { hideToast } from '../services/toaster';
import { OrderModel } from '../models';
import { showNotificationToast } from '../services/toaster';
import { compareAsc } from 'date-fns';

type LocalNotificationsStoreType = {
    notifications: Notification<OrderModel | undefined>[];
    actions: {
        pushNotification: (restaurantReference: string, type: Notification['type'], order?: OrderModel) => void;
        readNotification: (notificationId: Notification['id']) => void;
        markAllAsRead: () => void;
    };
};

export function buildLocalNotification(
    restaurantReference: string,
    type: Notification['type'],
    order?: OrderModel
): Notification<OrderModel | undefined> {
    return {
        id: `${restaurantReference}-${order ? order.public_reference + '-' : ''}${type}`,
        restaurantReference,
        type,
        read: false,
        context: order,
        createdAt: new Date()
    };
}

export const useLocalNotificationsStore = create<LocalNotificationsStoreType>()((set) => ({
    notifications: [],
    actions: {
        pushNotification: (restaurantReference, type, order) => {
            const notification = buildLocalNotification(restaurantReference, type, order);
            showNotificationToast(notification);

            set(({ notifications }) => {
                if (notifications.find((item) => item.id === notification.id)) {
                    return { notifications };
                }

                return { notifications: [...notifications, notification] };
            });
        },
        readNotification: (notificationId) =>
            set(({ notifications }) => {
                const newData = [...notifications];
                const notificationIndex = newData.findIndex((item) => item.id === notificationId);
                if (notificationIndex >= 0) {
                    hideToast(notificationId);
                    newData[notificationIndex].read = true;
                }
                return {
                    notifications: newData
                };
            }),
        markAllAsRead: () =>
            set(({ notifications }) => {
                const newData = notifications.map((item) => ({ ...item, read: true }));
                return {
                    notifications: newData
                };
            })
    }
}));

/** Hooks */
export const useLocalNotifications = () => useLocalNotificationsStore((state) => state.notifications);

export const useLastLocalNotification = (orderId: number) => {
    const { notifications } = useLocalNotificationsStore();
    return notifications
        .filter((item) => item.context && 'id' in item.context && item.context.id === orderId)
        .sort((itemA, itemB) => compareAsc(itemA.createdAt, itemB.createdAt))[0];
};

export const useLocalNotificationsActions = () => useLocalNotificationsStore((state) => state.actions);
