import axios from '@lo/shared/ajax/axiosSetup';
import { RestaurantInChainType } from '../types/restaurantInChainType';
import { AxiosPromise } from 'axios';

export function getRestaurantsApiQuery(): AxiosPromise<RestaurantInChainType[]> {
    return axios({
        url: `/restaurants`,
        method: 'get'
    });
}
