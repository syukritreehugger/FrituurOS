import { useCallback } from 'react';
import { DefaultError, useQuery } from '@tanstack/react-query';
import { OrderHistoryDataItem } from '../types/orderHistoryType';
import { getOrderHistoryApi } from '@lo/shared/api/orders';
import { sortOrderHistoryItems } from '../helpers/sorting/orderHistorySorting';
import OrderHistoryItemModel from '../models/OrderHistoryItemModel';
import { filterOrderHistoryItems, searchOrderHistoryItems } from '../helpers/filters/orderHistoryFilters';
import useRestaurant from './useRestaurant';
import usePinProtection from './usePinProtection';
import {
    useOrderHistoryDateRange,
    useOrderHistoryFilters,
    useOrderHistorySearch,
    useOrderHistorySorting
} from '../store/orderHistory';

export default () => {
    const restaurant = useRestaurant();
    const { pinIsChecked } = usePinProtection();
    const dateRange = useOrderHistoryDateRange();
    const filters = useOrderHistoryFilters();
    const sorting = useOrderHistorySorting();
    const search = useOrderHistorySearch();

    const queryResult = useQuery<OrderHistoryDataItem[], DefaultError, OrderHistoryItemModel[]>({
        queryKey: ['orderHistory', restaurant.id, dateRange.toLocaleString()],
        queryFn: () => getOrderHistoryApi(...dateRange),
        select: useCallback(
            (data: OrderHistoryDataItem[]) => {
                let newData = filterOrderHistoryItems(data, Object.values(filters).flat());
                if (search.isActive) newData = searchOrderHistoryItems(newData, search.value);
                newData = sortOrderHistoryItems(newData, `${sorting.column}.${sorting.direction}`);

                return newData.map((dataItem) => new OrderHistoryItemModel(dataItem));
            },
            [filters, sorting, search.isActive]
        ),
        enabled: pinIsChecked
    });

    return { ...queryResult, data: queryResult.data ?? [] };
};
