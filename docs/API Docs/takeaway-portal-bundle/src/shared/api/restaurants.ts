import axios from '@lo/shared/ajax/axiosSetup';
import { RestaurantSettings } from '../types/restaurantSettingsType';
import { UISettingsType } from '../types/uiSettingsType';
import { ReceiptSettings } from '../types/receiptSettingsType';
import { RestaurantData } from '../types/restaurantDataType';

export function getRestaurantApi(): Promise<RestaurantData> {
    return axios({
        url: '/restaurant',
        method: 'get'
    }).then((response) => response.data);
}

export function toggleRestaurantApi(restaurantAction: string): Promise<{ data: RestaurantData }> {
    return axios({
        url: `/restaurant/update-status`,
        method: 'post',
        data: {
            action: restaurantAction
        }
    });
}

export function updateSettingApi<TType extends 'general' | 'ui' | 'receipt'>(
    type: TType,
    name: TType extends 'general'
        ? keyof RestaurantSettings | 'food_preparation_duration' | 'average_delivery_duration'
        : TType extends 'ui'
          ? keyof UISettingsType
          : keyof ReceiptSettings,
    value: string | boolean | number | null
): Promise<{ data: RestaurantData }> {
    return axios({
        url: `/restaurant/setting/${type}`,
        method: 'patch',
        data: {
            name,
            value
        }
    });
}

export function createWorktimeSlotApi(
    type: 'all' | 'delivery' | 'pickup',
    reason: string,
    duration?: number
): Promise<RestaurantData> {
    return axios({
        url: `/restaurant/worktime/slot`,
        method: 'post',
        data: {
            type,
            reason,
            duration
        }
    }).then((response) => response.data);
}

export function deleteWorkTimeSlotApi(slotId: string): Promise<RestaurantData> {
    return axios({
        url: `/restaurant/worktime/${slotId}`,
        method: 'delete'
    }).then((response) => response.data);
}
