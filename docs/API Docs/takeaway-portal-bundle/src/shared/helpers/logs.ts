import axios from 'axios';
import config from '@lo/shared/services/config';
import { queryClient } from '@lo/shared/services/query';
import { RestaurantData } from '@lo/shared/types/restaurantDataType';
import { isProduction } from '@lo/shared/helpers/isProduction';
import retryOnFailure from '@lo/shared/helpers/retryOnFailure';

export async function saveLog(message: string, data: Record<string, any> = {}) {
    const restaurant = queryClient.getQueryData<RestaurantData>(['restaurant']);

    if (restaurant) {
        data.restaurantId = restaurant.id;
    }

    data.datetime = new Date().toUTCString();

    try {
        await retryOnFailure(() =>
            axios({
                url: `${config.apiUrl}/logs`,
                method: 'post',
                data: { message, data }
            })
        );
    } catch (error) {
        if (!isProduction()) {
            console.error(error);
        }
    }
}
