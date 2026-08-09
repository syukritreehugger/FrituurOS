import React, { ReactElement } from 'react';
import classes from './OrderCard.module.scss';
import OrderItem from '../OrderItem/OrderItem';
import { OrderModel } from '@lo/shared/models';
import classNames from 'classnames';
import { AlertCircle, AlertTriangle, CheckCircle, InfoCircle, Moped } from '@jet-pie/react/esm/icons';
import { Spinner } from '@jet-pie/react';
import { colors } from '../../../common/js/colorTokens';
import { NotificationLevel } from '@lo/shared/types/notificationType';
import { getNotificationLevel, getNotificationMessage } from '@lo/shared/helpers/notification/notificationMessageBuilder';
import { useLastLocalNotification } from '@lo/shared/store/localNotifications';
import { useOpenedOrderId, useOrdersStoreActions } from '@lo/shared/store/orders';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { useTranslation } from 'react-i18next';

type OrderCardProps = {
    order: OrderModel;
};

const iconSize = {
    width: 20,
    height: 20
};

const icons: { [key in NotificationLevel]: ReactElement } = {
    info: <InfoCircle {...iconSize} fill={colors.alias.contentDefault} />,
    success: <CheckCircle {...iconSize} fill={colors.alias.contentDefault} />,
    warning: <AlertTriangle {...iconSize} fill={colors.alias.contentDefault} />,
    error: <AlertCircle {...iconSize} fill={colors.alias.contentDefault} />
};

const OrderCard: React.FC<OrderCardProps> = (props) => {
    const { order } = props;

    const { t } = useTranslation();
    const restaurant = useRestaurant();
    const notification = useLastLocalNotification(order.id);
    const actions = useOrdersStoreActions();
    const openedOrderId = useOpenedOrderId();

    const isOpened = openedOrderId === order.id;
    const courier = order.couriers?.[0];
    const courierTitle = order.get_courier_title(restaurant, t);

    const showNotification =
        notification?.type === 'PrepareOrder' &&
        notification.context &&
        'id' in notification.context &&
        notification.context.id === order.id &&
        order.is_in_kitchen;

    const onClick = () => {
        if (isOpened) {
            actions.closeOrderDetails();
        } else {
            actions.openOrderDetails(order.id);
        }
    };

    return (
        <div
            data-testid={`order-${order.public_reference}`}
            className={classNames(classes.order, {
                [classes.active]: isOpened,
                [classes.cancelled]: order.is_cancelled,
                [classes.warning]: showNotification
            })}
            onClick={onClick}
        >
            {showNotification && (
                <div className={classNames(classes.orderNotification, classes[getNotificationLevel(notification)])}>
                    {icons[getNotificationLevel(notification)]}
                    <p
                        className={classes.courierText}
                        dangerouslySetInnerHTML={{ __html: getNotificationMessage(notification) }}
                    />
                </div>
            )}

            {order.has_failure_alert && (
                <div className={classNames(classes.orderNotification, classes['warning'])}>
                    <AlertTriangle {...iconSize} fill={colors.alias.supportWarning} />
                    <p className={classes.courierText}>{t('orders.live_orders_order_details.alert.pos_failure')}</p>
                </div>
            )}

            <OrderItem key={order.id} order={order} />

            {order.is_delivery && !restaurant.is_own_delivery && courierTitle && (
                <div className={classes.courierContainer}>
                    {courier?.avatar ? (
                        <img src={courier?.avatar} className={classes.courierIcon} alt="image" />
                    ) : courier ? (
                        <Moped className={classes.courierIcon} fill={colors.alias.contentDefault} />
                    ) : (
                        <Spinner size="XS" variant="secondary" />
                    )}

                    <div className={classes.courierText} data-testid={`order-courier-title-${order.public_reference}`}>
                        {courierTitle}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderCard;
