import { TFunction } from 'i18next';
import { OrderModel } from '../../models';

export const getOrderDetailsProductsTitle = (order: OrderModel, t: TFunction): string => {
    return (
        order.products.length +
        ' ' +
        (order.products.length === 1
            ? t('orders.live_orders_order_details.titles.order_one_item')
            : t('orders.live_orders_order_details.unavailable_items.items_column_title'))
    );
};
