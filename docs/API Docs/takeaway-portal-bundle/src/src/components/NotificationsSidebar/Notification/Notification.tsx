import React, { FC } from 'react';
import cn from 'classnames';
import { AlertTriangle, InfoCircle } from '@jet-pie/react/esm/icons';
import { Notification as NotificationType } from '@lo/shared/types/notificationType';
import { OrderData } from '@lo/shared/types/orderDataType';
import classes from './Notification.module.scss';
import {
    getNotificationLevel,
    getNotificationTitle,
    getNotificationMessage,
    getNotificationTimeLabel
} from '@lo/shared/helpers/notification/notificationMessageBuilder';
import { colors } from '../../../common/js/colorTokens';
import AlcoholInfoContent from './AlcoholInfoContent/AlcoholInfoContent';
import PrepareOrderContent from './PrepareOrderContent/PrepareOrderContent';

type NotificationProps = {
    notification: NotificationType<any>;
    onClose: () => void;
};

const Notification: FC<NotificationProps> = ({ notification, onClose }) => {
    const level = getNotificationLevel(notification);
    const timeLabel = getNotificationTimeLabel(notification);

    return (
        <div className={classes.container} data-testid={`notification-${notification.id}${notification.read ? '' : '-unread'}`}>
            <div className={cn(classes.header, classes[level])}>
                <div className={classes.title}>
                    {level === 'warning' ? (
                        <AlertTriangle width={14} height={14} fill={colors.alias.contentDefault} />
                    ) : (
                        <InfoCircle width={14} height={14} fill={colors.alias.contentDefault} />
                    )}

                    {getNotificationTitle(notification)}
                </div>

                <div className={classes.info}>
                    <span className={classes.timeLabel}>{timeLabel}</span>
                    {!notification.read && <span className={classes.notReadBadge} />}
                </div>
            </div>

            <div className={classes.content}>
                {notification.type === 'AlcoholInfo' && <AlcoholInfoContent />}

                {notification.type === 'PrepareOrder' && (
                    <PrepareOrderContent order={notification.context as OrderData} onClose={onClose} />
                )}

                {notification.type !== 'AlcoholInfo' && notification.type !== 'PrepareOrder' && (
                    <p>{getNotificationMessage(notification)}</p>
                )}
            </div>
        </div>
    );
};

export default Notification;
