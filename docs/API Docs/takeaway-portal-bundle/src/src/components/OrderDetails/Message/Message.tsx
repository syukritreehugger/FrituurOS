import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Button } from '@jet-pie/react';
import { OrderModel } from '@lo/shared/models';
import { getNotificationLevel, getNotificationFullMessage } from '@lo/shared/helpers/notification/notificationMessageBuilder';
import { useLastLocalNotification, useLocalNotificationsActions } from '@lo/shared/store/localNotifications';
import AlertMessage from '../../UI/AlertMessage/AlertMessage';
import classes from './Message.module.scss';

type MessageProps = {
    order: OrderModel;
};

const Message: React.FC<MessageProps> = (props) => {
    const { order } = props;
    const { t } = useTranslation();

    const notification = useLastLocalNotification(order.id);
    const isNotificationVisible = notification && !notification.read;
    const { readNotification } = useLocalNotificationsActions();

    const handleNotificationAction = () => {
        readNotification(notification.id);
    };

    if (order.is_delivered) return null;
    if (order.is_cancelled)
        return (
            <AlertMessage
                type="error"
                noRounding
                message={t('orders.live_orders_order_details.titles.order_cancelled')}
                testID="order-details-cancelled-message"
            />
        );

    if (order.has_failure_alert) {
        return (
            <AlertMessage
                type="warning"
                message={`${t('orders.live_orders_order_details.alert.pos_failure')}`}
                testID="order-details-order-failure-alert"
                iconSize={20}
            />
        );
    }

    if (isNotificationVisible)
        return (
            <div
                data-testid="order-details-notification"
                className={classNames(classes.notification, classes[getNotificationLevel(notification)])}
            >
                <p
                    data-testid="order-details-notification-message"
                    className={classes.notificationMessage}
                    dangerouslySetInnerHTML={{ __html: getNotificationFullMessage(notification) }}
                />
                <Button variant="primary" size="xSmall" onClick={handleNotificationAction}>
                    {t('orders.live_orders_order_details.actions.okay')}
                </Button>
            </div>
        );

    return null;
};

export default Message;
