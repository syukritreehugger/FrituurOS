import { DefaultError, useSuspenseQuery } from '@tanstack/react-query';
import { getRestaurantApi } from '../api/restaurants';
import { RestaurantModel } from '../models';
import { useCallback } from 'react';
import { RestaurantData } from '../types/restaurantDataType';

export default () => {
    const query = useSuspenseQuery<RestaurantData, DefaultError, RestaurantModel>({
        queryKey: ['restaurant'],
        queryFn: getRestaurantApi,
        select: useCallback((data: RestaurantData) => new RestaurantModel(data), []),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        refetchOnReconnect: 'always'
    });

    return query.data;
};
