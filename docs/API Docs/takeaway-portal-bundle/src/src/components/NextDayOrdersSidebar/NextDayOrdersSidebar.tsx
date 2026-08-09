import React from 'react';
import { useTranslation } from 'react-i18next';
import { SideSheet, IconButton } from '@jet-pie/react';
import { Close } from '@jet-pie/react/esm/icons';
import { OrderModel } from '@lo/shared/models';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import OrderItem from '../../pages/Orders/OrderItem/OrderItem';
import classes from './NextDayOrdersSidebar.module.scss';

type NextDayOrdersSidebarProps = {
    isOpen: boolean;
    orders: OrderModel[];
    toggleSidebar: () => void;
};

const NextDayOrdersSidebar: React.FC<NextDayOrdersSidebarProps> = ({ isOpen, toggleSidebar, orders }) => {
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();

    return (
        <SideSheet
            id="next-day-orders-sidebar"
            data-testid="next-day-orders-sidebar"
            isOpen={isOpen}
            onShowSideSheet={toggleSidebar}
            orientation="right"
            width={isLessThanTabletWidth ? '100%' : '490px'}
            hideOnOutsideClick
            hideHeader
            backdrop
        >
            <div className={classes.header}>
                <span>{t('orders.live_orders_order_list.other.scheduled_orders')}</span>
                <IconButton variant="ghost-tertiary" size="medium" onClick={toggleSidebar} icon={<Close />} />
            </div>

            <div className={classes.container}>
                <b>{t('orders.live_orders_order_list.scheduled_orders.you_have_orders', { count: orders.length })}</b>

                <span>{t('orders.live_orders_order_list.scheduled_orders.orders_will_appear_in_prepare_tab')}</span>

                {orders.map((order) => (
                    <div className={classes.order} key={order.id}>
                        <OrderItem order={order} />
                    </div>
                ))}
            </div>
        </SideSheet>
    );
};

export default NextDayOrdersSidebar;
