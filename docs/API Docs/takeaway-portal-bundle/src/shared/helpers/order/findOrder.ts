import { compareAsc } from 'date-fns';
import { getField } from '../array/nestedArray';
import { OrderData } from '../../types/orderDataType';
import { orderStatus } from '../../enums/orderStatusesEnum';

const orderStatusPriority = {
    [orderStatus.CONFIRMED]: 1,
    [orderStatus.KITCHEN]: 2,
    [orderStatus.IN_DELIVERY]: 3,
    [orderStatus.DELIVERED]: 4,
    [orderStatus.CANCELLED]: 5
};

export const findMostUrgentOrderId = (orders: OrderData[]): number | undefined => {
    const urgentOrder = [...orders]
        .filter((order) => order.status !== orderStatus.NEW)
        .sort((a, b) => compareAsc(getField(a, 'requested_time') as Date, getField(b, 'requested_time') as Date))
        .sort(
            (a, b) =>
                (orderStatusPriority[a.status as keyof typeof orderStatusPriority] ?? 0) -
                (orderStatusPriority[b.status as keyof typeof orderStatusPriority] ?? 0)
        )[0];

    return urgentOrder ? urgentOrder.id : undefined;
};

export const findOrderByGlobalId = (orders: OrderData[], globalId: string): OrderData | undefined => {
    if (globalId) {
        return orders.find((order) => order.global_id === globalId);
    }
    return;
};
