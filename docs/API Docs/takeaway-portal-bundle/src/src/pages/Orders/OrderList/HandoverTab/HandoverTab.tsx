import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import useOrders from '@lo/shared/hooks/useOrders';
import orderTimePng from '@lo/shared/images/order-time.png';
import NoOrders from '../NoOrders/NoOrders';
import OrderCard from '../../OrderCard/OrderCard';
import { useIsTrainingActive, useTrainingOrder } from '@lo/shared/store/trainings';
import useUrgentOrder from '@lo/shared/hooks/useUrgentOrder';

const HandoverTab: FC = () => {
    const { t } = useTranslation();
    const { data } = useOrders();

    const isTrainingActive = useIsTrainingActive();
    const trainingOrders = useTrainingOrder();
    const orders = isTrainingActive ? (trainingOrders ? [trainingOrders] : []) : (data?.array ?? []);
    const filteredOrders = orders.filter((order) => order.is_in_delivery);

    useUrgentOrder(filteredOrders, 'handover');

    if (filteredOrders.length === 0) {
        return (
            <NoOrders
                title={t('orders.live_orders_order_list.tabs.handover_no_orders_title')}
                description={t('orders.live_orders_order_list.tabs.handover_no_orders_description')}
                imageSrc={orderTimePng}
            />
        );
    }

    return filteredOrders.map((order) => <OrderCard key={order.id} order={order} />);
};

export default HandoverTab;
