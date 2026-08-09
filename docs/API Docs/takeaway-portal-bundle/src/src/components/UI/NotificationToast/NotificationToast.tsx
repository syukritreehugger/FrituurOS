import React, { FC } from 'react';
import { AlertTriangle, InfoCircle } from '@jet-pie/react/esm/icons';
import cn from 'classnames';
import classes from './NotificationToast.module.scss';
import { colors } from '../../../common/js/colorTokens';
import { Notification } from '@lo/shared/types/notificationType';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import {
    getNotificationLevel,
    getNotificationMessage,
    getNotificationTitle
} from '@lo/shared/helpers/notification/notificationMessageBuilder';

type NotificationToastProps = {
    notification: Notification<any>;
};

const NotificationToast: FC<NotificationToastProps> = ({ notification }) => {
    const { isLessThanTabletWidth } = useWindowSize();
    const level = getNotificationLevel(notification);

    return (
        <div className={cn(classes.container, classes[level])} style={{ width: isLessThanTabletWidth ? '100%' : '304px' }}>
            <div className={classes.titleContainer}>
                {level === 'warning' ? (
                    <AlertTriangle width={14} height={14} fill={colors.alias.contentDefault} />
                ) : (
                    <InfoCircle width={14} height={14} fill={colors.alias.contentDefault} />
                )}
                <span>{getNotificationTitle(notification)}</span>
            </div>

            <div className={classes.text} dangerouslySetInnerHTML={{ __html: getNotificationMessage(notification) }} />
        </div>
    );
};

export default NotificationToast;
