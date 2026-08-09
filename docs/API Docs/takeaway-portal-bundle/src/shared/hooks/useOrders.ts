import { DefaultError, useQuery } from '@tanstack/react-query';
import { getOrdersApi } from '../api/orders';
import OrderModel from '../models/OrderModel';
import useRestaurant from './useRestaurant';
import { useCallback } from 'react';

type OrdersMap = Map<number, OrderModel>;

export default () => {
    const restaurant = useRestaurant();

    return useQuery<OrdersMap, DefaultError, { map: OrdersMap; array: OrderModel[] }>({
        queryKey: ['orders', restaurant.id],
        queryFn: async () => {
            const ordersData = await getOrdersApi();

            return ordersData.reduce((acc, order) => {
                acc.set(order.id, new OrderModel(order));

                return acc;
            }, new Map<number, OrderModel>());
        },
        select: useCallback((data: OrdersMap) => {
            return {
                map: data,
                array: Array.from(data.values())
            };
        }, []),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        refetchOnReconnect: 'always'
    });
};
