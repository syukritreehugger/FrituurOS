import { DefaultError, useMutation, useQueryClient } from '@tanstack/react-query';
import { RestaurantSettings } from '../types/restaurantSettingsType';
import { updateSettingApi } from '@lo/shared/api/restaurants';
import { UISettingsType } from '../types/uiSettingsType';
import { ReceiptSettings } from '../types/receiptSettingsType';
import { RestaurantData } from '../types/restaurantDataType';
import analytics from '@lo/shared/services/analytics';
import useRestaurant from './useRestaurant';

const useUpdateSetting = (
    type: 'general' | 'ui' | 'receipt',
    name:
        | keyof RestaurantSettings
        | keyof UISettingsType
        | keyof ReceiptSettings
        | 'food_preparation_duration'
        | 'average_delivery_duration'
) => {
    const restaurant = useRestaurant();
    const queryClient = useQueryClient();

    return useMutation<RestaurantData, DefaultError, any>({
        mutationFn: (value) => updateSettingApi(type, name, value).then((response) => response.data),
        onMutate(value) {
            switch (name) {
                case 'food_preparation_duration':
                    analytics.settings.changedDuration('cook', value - restaurant.food_preparation_duration);
                    break;
                case 'average_delivery_duration':
                    analytics.settings.changedDuration('delivery', value - restaurant.average_delivery_duration);
                    break;
                case 'show_customer_address':
                    analytics.settings.toggled('delivery display', 'address', value);
                    break;
                case 'show_customer_postcode':
                    analytics.settings.toggled('delivery display', 'postcode', value);
                    break;
                case 'show_order_reference':
                    analytics.settings.toggled('delivery display', 'order reference', value);
                    break;
                case 'show_customer_name':
                    analytics.settings.toggled('delivery display', 'name', value);
                    break;
                case 'show_product_id':
                    analytics.settings.toggled('order list', 'product id', value);
                    break;
                case 'auto_print_enabled':
                    analytics.settings.toggled('receipt', 'auto print', value);
                    break;
                case 'enable_tutorials':
                    analytics.settings.toggled('tutorials', 'tutorials', value);
                    break;
                case 'incoming_order_sound':
                case 'order_update_sound':
                case 'other_notification_sound':
                    analytics.settings.changedSound(value);
                    break;
            }
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['restaurant'], data);
        }
    });
};

export default useUpdateSetting;
