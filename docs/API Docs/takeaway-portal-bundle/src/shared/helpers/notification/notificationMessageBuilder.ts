import { Notification } from '../../types/notificationType';
import { Courier } from '../../types/courierType';
import { differenceInMinutes, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import i18n from '@lo/shared/localization/i18n';
import { OutOfStockProductNotification, OutOfStockProductsNotification } from '../../types/menuType';
import { formatTime } from '../formatTime';
import { OrderData } from '../../types/orderDataType';

const buildCourierDeliveredLastOrderMessage = (notification: Notification<Courier>) => {
    const courier = notification.context;
    const getBackMinutes = courier.estimatedAtRestaurantTime
        ? differenceInMinutes(courier.estimatedAtRestaurantTime, new Date())
        : 0;

    return i18n.t('orders.live_orders_notifications.notification.last_order_delivered', {
        courierName: `${courier.name}`,
        getBackMinutes: getBackMinutes < 0 ? 0 : `~${getBackMinutes}`
    });
};

const buildProductOutOfStockMessage = (notification: Notification<OutOfStockProductNotification>) => {
    const context = notification.context;
    const product = context.product;

    return product.isSoldOut
        ? i18n.t('orders.live_orders_menu.main.out_of_stock_toaster', {
              product: product.name
          })
        : i18n.t('orders.live_orders_menu.main.in_stock_toaster', {
              product: product.name
          });
};

const buildProductsOutOfStockMessage = (notification: Notification<OutOfStockProductsNotification>) => {
    const context = notification.context;
    const products = context.products;

    return products[0].is_sold_out
        ? i18n.t('orders.live_orders_menu.main.out_of_stock_toaster', {
              product: products.map((product) => product.name).join(', ')
          })
        : i18n.t('orders.live_orders_menu.main.in_stock_toaster', {
              product: products.map((product) => product.name).join(', ')
          });
};

export function getNotificationTitle(notification: Notification<OrderData>) {
    return notification.context && 'public_reference' in notification.context
        ? `#${notification.context.public_reference}`
        : i18n.t('orders.live_orders_notifications.main.info_title');
}

export function getNotificationLevel(notification: Notification<any>) {
    switch (notification.type) {
        case 'PrepareOrder':
            return 'warning';
        default:
            return 'info';
    }
}

export function getNotificationMessage(notification: Notification<any>) {
    switch (notification.type) {
        case 'DeliveredLastOrder':
            return buildCourierDeliveredLastOrderMessage(notification);
        case 'ProductStockUpdate':
            return buildProductOutOfStockMessage(notification);
        case 'ProductsStockUpdate':
            return buildProductsOutOfStockMessage(notification);
        case 'AlcoholInfo':
            return i18n.t('orders.live_orders_notifications.alcohol.message', { beginStrong: '<b>', endStrong: '</b>' });
        case 'PrepareOrder':
            return i18n.t('orders.live_orders_notifications.prepare_order.message', {
                beginStrong: '<b>',
                endStrong: '</b>'
            });
        default:
            return '';
    }
}

export function getNotificationFullMessage(notification: Notification<any>) {
    switch (notification.type) {
        case 'AlcoholInfo':
            return i18n.t('orders.live_orders_notifications.alcohol.full_message', {
                beginStrong: '<b>',
                endStrong: '</b>'
            });
        case 'PrepareOrder':
            return i18n.t('orders.live_orders_notifications.prepare_order.full_message', {
                beginStrong: '<b>',
                endStrong: '</b>'
            });
        default:
            return getNotificationMessage(notification);
    }
}

export function getNotificationTimeLabel(notification: Notification<any>): string {
    const timeDifference = notification.createdAt ? differenceInMinutes(new Date(), notification.createdAt) : undefined;

    if (timeDifference === undefined) return '';

    if (timeDifference === 0) return i18n.t('orders.live_orders_notifications.main.now');
    if (timeDifference === 1) return i18n.t('orders.live_orders_notifications.main.one_minute_ago');
    if (timeDifference <= 60) return i18n.t('orders.live_orders_notifications.main.minutes_ago', { minutes: timeDifference });
    if (timeDifference < 120) return i18n.t('orders.live_orders_notifications.main.one_hour_ago');
    return i18n.t('orders.live_orders_notifications.main.hours_ago', { hours: Math.round(timeDifference / 60) });
}

const buildSubText = (timezone: string, notification: Notification<any>): string => {
    const zonedCreatedAt = toZonedTime(notification.createdAt, timezone);
    const zonedNow = toZonedTime(new Date(), timezone);

    const day = isSameDay(zonedCreatedAt, zonedNow)
        ? i18n.t('orders.live_orders_notifications.notification.today')
        : i18n.t('orders.live_orders_notifications.notification.yesterday');

    const time = formatTime(notification.createdAt, 'HH:mm', timezone) || '';

    return i18n.t('orders.live_orders_notifications.notification.subText', { day, time });
};

export default function notificationMessageBuilder(timezone: string, notification: Notification): [string, string] {
    const mainText = getNotificationMessage(notification);
    if (
        notification.type !== 'DeliveredLastOrder' &&
        notification.type !== 'ProductStockUpdate' &&
        notification.type !== 'ProductsStockUpdate' &&
        notification.type !== 'AlcoholInfo' &&
        notification.type !== 'PrepareOrder'
    ) {
        return ['', ''];
    }

    const subText = buildSubText(timezone, notification);
    return [mainText, subText];
}
