import { useMemo } from 'react';
import { OrderModel } from '../models';
import useOrders from './useOrders';

type OrdersByTabs = {
    prepare: OrderModel[];
    scheduled: OrderModel[];
    nextDayScheduled: OrderModel[];
    handover: OrderModel[];
    done: OrderModel[];
    cancelled: OrderModel[];
};

function useOrdersByTabs() {
    const { data } = useOrders();
    const orders = data ? data.array : [];

    return useMemo(() => {
        return orders.reduce(
            (acc, order) => {
                if (order.is_cancelled) {
                    acc.cancelled.push(order);
                    return acc;
                }

                if (order.is_next_day_scheduled) {
                    acc.nextDayScheduled.push(order);
                    return acc;
                }

                if (order.is_scheduled) {
                    acc.scheduled.push(order);
                    return acc;
                }

                if (order.is_new || order.is_confirmed || order.is_in_kitchen) {
                    acc.prepare.push(order);
                    return acc;
                }

                if (order.is_in_delivery) {
                    acc.handover.push(order);
                    return acc;
                }

                acc.done.push(order);
                return acc;
            },
            { prepare: [], scheduled: [], nextDayScheduled: [], handover: [], done: [], cancelled: [] } as OrdersByTabs
        );
    }, [orders]);
}

export default useOrdersByTabs;
