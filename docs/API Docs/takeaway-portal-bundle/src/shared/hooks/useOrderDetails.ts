import { DefaultError, useQuery } from '@tanstack/react-query';
import { getOrderApi } from '../api/orders';
import { OrderModel } from '../models';
import useRestaurant from './useRestaurant';
import useOrders from './useOrders';
import { queryClient } from '../services/query';

export default (id: number | null) => {
    const restaurant = useRestaurant();
    const { isFetching } = useOrders();

    return useQuery<OrderModel | null, DefaultError>({
        queryKey: ['orders', 'details', id],
        queryFn: async () => {
            const orders = queryClient.getQueryData<Map<number, OrderModel>>(['orders', restaurant.id]);

            if (!id || !orders) return null;

            return orders.get(id) ?? new OrderModel(await getOrderApi(id));
        },
        enabled: !isFetching
    });
};
