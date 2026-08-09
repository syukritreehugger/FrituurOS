import React from 'react';
import useNotifications from '@lo/shared/hooks/useNotifications';
import classes from './NotificationsSidebar.module.scss';
import RepeaterContainer from '../UI/RepeaterContainer/RepeaterContainer';
import NotificationSkeleton from './NotificationSkeleton/NotificationSkeleton';
import { useTranslation } from 'react-i18next';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import upToDateImage from '@lo/shared/images/up-to-date.png';
import { SideSheet } from '@jet-pie/react';
import NotificationsHeader from './NotificationsHeader/NotificationsHeader';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import Notification from './Notification/Notification';

type NotificationsSidebarProps = {
    isOpen: boolean;
    toggleSidebar: () => void;
};

const NotificationsSidebar: React.FC<NotificationsSidebarProps> = ({ isOpen, toggleSidebar }) => {
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();
    const { notifications, urgentNotifications, selectedTab, setSelectedTab, sorting, setSorting, isFetching, markAllAsRead } =
        useNotifications();
    const restaurant = useRestaurant();
    const isUrgentTabHidden = urgentNotifications.length === 0;

    const handleClose = () => {
        markAllAsRead();
        toggleSidebar();
    };

    return (
        <SideSheet
            id="notificationsSideSheet"
            data-testid="notifications-sidebar"
            isOpen={isOpen}
            onShowSideSheet={handleClose}
            orientation="right"
            width={isLessThanTabletWidth ? '100%' : '490px'}
            hideOnOutsideClick
            hideHeader
            backdrop
        >
            <div className={classes.container}>
                <NotificationsHeader
                    onClose={handleClose}
                    selectedTab={selectedTab}
                    sorting={sorting}
                    isUrgentTabHidden={isUrgentTabHidden}
                    notificationsCounter={notifications.length}
                    urgentNotificationsCounter={urgentNotifications.length}
                    onTabChange={setSelectedTab}
                    onSortingChange={setSorting}
                />

                {isFetching && (
                    <RepeaterContainer times={3}>
                        <NotificationSkeleton />
                    </RepeaterContainer>
                )}

                {notifications.length > 0 && restaurant.timezone ? (
                    <div className={classes.list} data-testid="notifications-container">
                        {(selectedTab === 'urgent' ? urgentNotifications : notifications).map((notification) => (
                            <Notification key={notification.id} onClose={handleClose} notification={notification} />
                        ))}
                    </div>
                ) : (
                    <div data-testid="empty-notifications-container" className={classes.emptyContainer}>
                        <img className={classes.upToDateImage} src={upToDateImage} />
                        <p className={classes.emptyTitle}>{t('orders.live_orders_notifications.main.no_notifications_title')}</p>
                        <p className={classes.emptyDescription}>
                            {t('orders.live_orders_notifications.main.no_notifications_description')}
                        </p>
                    </div>
                )}
            </div>
        </SideSheet>
    );
};

export default NotificationsSidebar;
