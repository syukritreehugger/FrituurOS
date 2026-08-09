import { ORDER_STATUSES_SEQUENCE } from '../../constants';
import { orderStatus } from '../../enums/orderStatusesEnum';
import { OrderModel, RestaurantModel } from '../../models';

export const shouldIgnoreOrderUpdate = (
    existingOrder: OrderModel,
    newOrder: OrderModel,
    restaurant: RestaurantModel
): boolean => {
    const previousStatusIndex = ORDER_STATUSES_SEQUENCE.findIndex((status) => status === existingOrder.status);
    const newStatusIndex = ORDER_STATUSES_SEQUENCE.findIndex((status) => status === newOrder.status);

    // Cancelled orders can be moved back
    if (existingOrder.status === orderStatus.CANCELLED) {
        return false;
    }

    // Own delivery restaurants can move orders from in_delivery to in_kitchen
    if (restaurant.can_revert_order_status && existingOrder.is_in_delivery && newOrder.is_in_kitchen) {
        return false;
    }

    return previousStatusIndex > newStatusIndex;
};
