import React, { FC, useState } from 'react';
import { Accordion, Button } from '@jet-pie/react';
import { ClockFilled } from '@jet-pie/react/esm/icons';
import useOrdersByTabs from '@lo/shared/hooks/useOrdersByTabs';
import gettingMoreOrdersPng from '@lo/shared/images/getting-more-orders.png';
import NoOrders from '../NoOrders/NoOrders';
import { useTranslation } from 'react-i18next';
import OrderCard from '../../OrderCard/OrderCard';
import { useIsTrainingActive, useTrainingOrder } from '@lo/shared/store/trainings';
import NextDayOrdersSidebar from '@lo/web/components/NextDayOrdersSidebar/NextDayOrdersSidebar';
import classes from './PrepareTab.module.scss';
import useUrgentOrder from '@lo/shared/hooks/useUrgentOrder';

const PrepareTab: FC = () => {
    const { t } = useTranslation();
    const orders = useOrdersByTabs();
    const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
    const isTrainingActive = useIsTrainingActive();
    const trainingOrders = useTrainingOrder();
    const visibleOrders = isTrainingActive ? (trainingOrders ? [trainingOrders] : []) : orders.prepare;
    useUrgentOrder(visibleOrders, 'prepare');

    const allScheduledOrdersCount = orders.scheduled.length + orders.nextDayScheduled.length;
    return (
        <>
            {visibleOrders.length === 0 && (
                <NoOrders
                    title={t('orders.live_orders_order_list.tabs.prepare_no_orders_title')}
                    description={t('orders.live_orders_order_list.tabs.prepare_no_orders_description')}
                    imageSrc={gettingMoreOrdersPng}
                />
            )}

            {visibleOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}

            {allScheduledOrdersCount > 0 && (
                <div className={classes.scheduledOrdersBlock}>
                    <Accordion
                        icon={<ClockFilled />}
                        primaryText={`${t('orders.live_orders_order_list.other.scheduled_orders')} (${allScheduledOrdersCount})`}
                        variant="low-emphasis"
                        data-testid="scheduled"
                    >
                        <div className={classes.scheduledOrdersList}>
                            {orders.scheduled.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>

                        {orders.nextDayScheduled.length > 0 && (
                            <div className={classes.nextDayScheduledOrdersBlock}>
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: t(
                                            'orders.live_orders_order_list.scheduled_orders.there_are_orders_for_other_days',
                                            {
                                                replace: {
                                                    count: `<b>${orders.nextDayScheduled.length}</b>`
                                                }
                                            }
                                        )
                                    }}
                                />
                                <Button
                                    variant="primary"
                                    size="xSmall"
                                    onClick={() => setSidebarIsOpen(true)}
                                    className={classes.viewNextDayOrdersButton}
                                    data-testid="view-next-day-orders-button"
                                >
                                    {t('orders.live_orders_order_list.scheduled_orders.view')}
                                </Button>
                            </div>
                        )}
                    </Accordion>
                </div>
            )}

            <NextDayOrdersSidebar
                isOpen={sidebarIsOpen}
                orders={orders.nextDayScheduled}
                toggleSidebar={() => setSidebarIsOpen(!sidebarIsOpen)}
            />
        </>
    );
};

export default PrepareTab;
