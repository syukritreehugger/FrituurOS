import { useOpenedOrderId, useOrdersStoreActions, useOrderUpdatedFromSocket } from '../store/orders';
import { useWindowSize } from '@lo/web/src/hooks/useWindowSize';
import { findMostUrgentOrderId } from '../helpers/order/findOrder';
import { OrderModel } from '../models';
import { useEffect } from 'react';

const useUrgentOrder = (orders: OrderModel[], tab: 'prepare' | 'handover' | 'done') => {
    const openedOrderId = useOpenedOrderId();
    const { isLessThanTabletWidth } = useWindowSize();
    const orderActions = useOrdersStoreActions();
    const orderUpdatedFromSocket = useOrderUpdatedFromSocket();

    useEffect(() => {
        orderActions.closeOrderDetails();
    }, [tab]);

    useEffect(() => {
        if (orderUpdatedFromSocket) {
            orderActions.resetOrderUpdatedFromSocket();
            orderActions.closeOrderDetails();
        } else {
            if (openedOrderId || isLessThanTabletWidth) return;
            const urgentOrderId = findMostUrgentOrderId(orders);
            if (urgentOrderId) orderActions.openOrderDetails(urgentOrderId);
        }
    }, [openedOrderId, orders, isLessThanTabletWidth]);
};

export default useUrgentOrder;
