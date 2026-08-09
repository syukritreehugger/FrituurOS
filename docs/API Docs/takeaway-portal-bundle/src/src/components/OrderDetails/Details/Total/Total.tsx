import React from 'react';
import { useTranslation } from 'react-i18next';
import TotalItem from './TotalItem';
import { OrderModel, RestaurantModel } from '@lo/shared/models';
import classes from './Total.module.scss';

type TotalProps = {
    order: OrderModel;
    restaurant: RestaurantModel;
};

const Total: React.FC<TotalProps> = (props) => {
    const { order, restaurant } = props;
    const { t } = useTranslation();

    return (
        <div className={classes.container}>
            <TotalItem
                title={t('orders.live_orders_order_details.titles.subtotal')}
                dataTestId="order-details-subtotal"
                value={order.subtotal.toFixed(2)}
                currency={order.currency}
            />

            {restaurant.is_own_delivery && !order.is_pickup && order.delivery_fee > 0 && (
                <TotalItem
                    title={t('orders.live_orders_order_details.titles.delivery_fee')}
                    dataTestId="order-details-delivery-fee-own-delivery"
                    value={order.delivery_fee.toFixed(2)}
                    currency={order.currency}
                />
            )}

            {order.service_fee > 0 && (
                <TotalItem
                    title={t('orders.live_orders_order_details.titles.service_fee')}
                    dataTestId="order-details-service-fee"
                    value={order.service_fee.toFixed(2)}
                    currency={order.currency}
                />
            )}

            {(order.small_order_fee ?? 0) > 0 && (
                <TotalItem
                    title={t('orders.live_orders_order_details.titles.small_order_fee')}
                    dataTestId="order-details-small-order-fee"
                    value={(order.small_order_fee ?? 0).toFixed(2)}
                    currency={order.currency}
                />
            )}

            {order.discounts_total > 0 && (
                <TotalItem
                    title={t('orders.live_orders_order_details.titles.discount')}
                    dataTestId="order-details-discounts"
                    value={order.discounts_total.toFixed(2)}
                    currency={order.currency}
                />
            )}

            {order.stampcards_total > 0 && (
                <TotalItem
                    title={t('orders.live_orders_order_details.titles.stampcard_program')}
                    dataTestId="order-details-stampcard"
                    value={`-${order.stampcards_total.toFixed(2)}`}
                    currency={order.currency}
                />
            )}

            <TotalItem
                bold
                title={t('orders.live_orders_order_details.titles.total')}
                dataTestId="order-details-total"
                value={order.customer_total.toFixed(2)}
                currency={order.currency}
            />

            {!restaurant.is_own_delivery && !order.is_pickup && order.delivery_fee > 0 && (
                <TotalItem
                    title={t('orders.live_orders_order_details.titles.delivery_fee')}
                    dataTestId="order-details-delivery-fee-3d-party"
                    value={order.delivery_fee.toFixed(2)}
                    currency={order.currency}
                />
            )}

            {order.payment && order.payment.pays_with !== undefined && Number(order.payment.pays_with) > 0 && (
                <p data-testid="order-details-pays-with">
                    {t('orders.live_orders_order_details.titles.pays_with')}: {order.currency}{' '}
                    {Number(order.payment.pays_with).toFixed(2)}
                </p>
            )}
        </div>
    );
};

export default Total;
