import { useQuery } from '@tanstack/react-query';
import { getRestaurantsApiQuery } from '../api/chains';
import { RestaurantInChainType } from '../types/restaurantInChainType';

export default () => {
    return useQuery<RestaurantInChainType[]>({
        queryKey: ['chainRestaurants'],
        queryFn: () => getRestaurantsApiQuery().then((response) => response.data),
        staleTime: 1000 * 60 * 60 * 12 // Settling for 12 hours since the data is not expected to change often
    });
};
