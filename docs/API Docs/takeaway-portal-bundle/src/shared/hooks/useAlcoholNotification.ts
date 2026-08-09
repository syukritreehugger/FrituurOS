import { useEffect } from 'react';
import useOrders from './useOrders';
import { useLocalNotificationsActions } from '../store/localNotifications';
import useRestaurant from './useRestaurant';

export function useAlcoholNotification() {
    const restaurant = useRestaurant();
    const { data } = useOrders();
    const { pushNotification } = useLocalNotificationsActions();

    useEffect(() => {
        const orderWithAlcoholExists = data?.array.some(
            (order) => order.with_alcohol && !order.is_delivered && !order.is_cancelled
        );

        if (orderWithAlcoholExists) {
            pushNotification(restaurant.reference, 'AlcoholInfo');
        }
    }, [data?.array.length, pushNotification, restaurant.reference]);
}
