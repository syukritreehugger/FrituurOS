import React from 'react';
import classes from './NotificationsHeader.module.scss';
import { Chip, IconButton } from '@jet-pie/react';
import { Close } from '@jet-pie/react/esm/icons';
import { useTranslation } from 'react-i18next';
import NotificationsSorting from '../NotificationsSorting/NotificationsSorting';
import { trainingElements } from '@lo/shared/types/trainings';

type NotificationsHeaderProps = {
    selectedTab: 'urgent' | 'all';
    sorting: 'desc' | 'asc';
    isUrgentTabHidden: boolean;
    notificationsCounter: number;
    urgentNotificationsCounter: number;
    onTabChange: (selectedTab: 'urgent' | 'all') => void;
    onSortingChange: (sorting: 'desc' | 'asc') => void;
    onClose: () => void;
};

const NotificationsHeader: React.FC<NotificationsHeaderProps> = (props) => {
    const {
        selectedTab,
        sorting,
        isUrgentTabHidden,
        notificationsCounter,
        urgentNotificationsCounter,
        onTabChange,
        onSortingChange,
        onClose
    } = props;
    const { t } = useTranslation();

    return (
        <div className={classes.headerContainer}>
            <div className={classes.header}>
                <p className={classes.headerTitle}>{t('orders.live_orders_navigation.menu.notifications')}</p>
                <IconButton
                    icon={<Close />}
                    variant="ghost-tertiary"
                    onClick={onClose}
                    size="small"
                    data-testid="close-notifications-sidebar"
                />
            </div>
            <div className={classes.filters} data-training-id={trainingElements.notificationsTabs}>
                {!isUrgentTabHidden && (
                    <Chip
                        data-testid="notifications-urgent-tab"
                        className={classes.chip}
                        label={`${t('orders.live_orders_notifications.main.urgent_tab_title')} (${urgentNotificationsCounter})`}
                        onClick={() => onTabChange('urgent')}
                        selected={selectedTab === 'urgent'}
                    />
                )}
                <Chip
                    data-testid="notifications-all-tab"
                    className={classes.chip}
                    label={`${t('orders.live_orders_notifications.main.all_tab_title')} (${notificationsCounter})`}
                    onClick={() => onTabChange('all')}
                    selected={selectedTab === 'all'}
                />
                <NotificationsSorting selected={sorting} onChange={onSortingChange} />
            </div>
        </div>
    );
};

export default NotificationsHeader;
