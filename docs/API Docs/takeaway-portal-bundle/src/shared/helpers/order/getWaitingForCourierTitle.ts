import { TFunction } from 'i18next';
import OrderModel from '../../models/OrderModel';

export const getWaitingForCourierTitle = (order: OrderModel, t: TFunction): string => {
    return order.is_confirmed
        ? t('orders.live_orders_order_details.titles.waiting_for_courier_dont_prep')
        : t('orders.live_orders_order_details.titles.waiting_for_courier');
};
