import React, { FC } from 'react';
import useOrders from '@lo/shared/hooks/useOrders';
import NoOrders from '../NoOrders/NoOrders';
import orderHistoryPng from '@lo/shared/images/order-history.png';
import { useTranslation } from 'react-i18next';
import { Accordion } from '@jet-pie/react';
import { Restricted } from '@jet-pie/react/esm/icons';
import OrderCard from '../../OrderCard/OrderCard';
import classes from './DoneTab.module.scss';
import { useIsTrainingActive, useTrainingOrder } from '@lo/shared/store/trainings';
import useUrgentOrder from '@lo/shared/hooks/useUrgentOrder';

const DoneTab: FC = () => {
    const { t } = useTranslation();
    const { data } = useOrders();

    const isTrainingActive = useIsTrainingActive();
    const trainingOrders = useTrainingOrder();
    const orders = isTrainingActive ? (trainingOrders ? [trainingOrders] : []) : (data?.array ?? []);
    const deliveredOrders = orders.filter((order) => order.is_delivered);
    const cancelledOrders = orders.filter((order) => order.is_cancelled);

    useUrgentOrder(deliveredOrders, 'done');

    return (
        <>
            {deliveredOrders.length === 0 && (
                <NoOrders
                    title={t('orders.live_orders_order_list.tabs.done_no_orders_title')}
                    description={t('orders.live_orders_order_list.tabs.done_no_orders_description')}
                    imageSrc={orderHistoryPng}
                />
            )}

            {deliveredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}

            {cancelledOrders.length > 0 && (
                <div className={classes.cancelledBlock}>
                    <Accordion
                        icon={
                            <div className={classes.cancelledIcon}>
                                <Restricted />
                            </div>
                        }
                        primaryText={`${t('orders.live_orders_order_list.other.cancelled_orders')} (${cancelledOrders.length})`}
                        variant="low-emphasis"
                        data-testid="cancelled"
                    >
                        <div className={classes.cancelledList}>
                            {cancelledOrders.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    </Accordion>
                </div>
            )}
        </>
    );
};

export default DoneTab;
