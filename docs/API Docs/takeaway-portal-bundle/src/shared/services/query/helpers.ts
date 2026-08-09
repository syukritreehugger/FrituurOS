import addOrUpdateItemInArray from '../../helpers/array/addOrUpdateItemInArray';
import { OrderModel } from '../../models';
import { Notification } from '../../types/notificationType';
import { OrderData } from '../../types/orderDataType';
import { RestaurantData } from '../../types/restaurantDataType';
import queryClient from './queryClient';

export function updateOrderInOrdersQuery(order: OrderData | OrderModel) {
    const restaurant = queryClient.getQueryData<RestaurantData>(['restaurant']) as RestaurantData;
    const isFetching = queryClient.getQueryState(['orders', restaurant?.id])?.fetchStatus === 'fetching';

    if (isFetching || !restaurant) {
        return;
    }

    const orderModel = order instanceof OrderModel ? order : new OrderModel(order);

    queryClient.setQueryData<Map<number, OrderModel>>(['orders', restaurant.id], (orders) => {
        return new Map(orders).set(order.id, orderModel);
    });

    queryClient.setQueryData<OrderModel>(['orders', 'details', order.id], (oldOrder) => oldOrder && orderModel);
}

export function updateOrdersInOrdersQuery(orders: OrderData[] | OrderModel[]) {
    const restaurant = queryClient.getQueryData<RestaurantData>(['restaurant']);
    const isFetching = queryClient.getQueryState(['orders', restaurant?.id])?.fetchStatus === 'fetching';

    if (isFetching || !restaurant) {
        return;
    }

    queryClient.setQueryData<Map<number, OrderModel>>(['orders', restaurant.id], (oldOrders) => {
        const newOrders = new Map(oldOrders);

        orders.forEach((order) => {
            const orderModel = order instanceof OrderModel ? order : new OrderModel(order);
            queryClient.setQueryData<OrderModel>(['orders', 'details', order.id], (oldOrder) => oldOrder && orderModel);

            newOrders.set(order.id, orderModel);
        });

        return newOrders;
    });
}

export function updateNotificationInNotificationsQuery(newNotification: Notification) {
    const restaurant = queryClient.getQueryData<RestaurantData>(['restaurant']) as RestaurantData;

    queryClient.setQueryData<Notification[]>(['notifications', restaurant.id], (notifications) => {
        return notifications && addOrUpdateItemInArray(newNotification, notifications);
    });
}
