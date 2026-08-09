import OrderModel from '../../models/OrderModel';
import { differenceInObjects } from '../differenceInObjects';

export const showOrderUpdateNotification = (newOrder: OrderModel, orderToUpdate: OrderModel): boolean => {
    const ordersDifference = differenceInObjects(newOrder, orderToUpdate);
    const timeValues = ordersDifference.filter((item) =>
        [
            'restaurant_estimated_pickup_time',
            'restaurant_estimated_delivery_time',
            'delivery_service_delivery_time',
            'delivery_service_pickup_time'
        ].includes(item)
    );

    return ordersDifference.length !== timeValues.length || newOrder.status !== orderToUpdate.status;
};
