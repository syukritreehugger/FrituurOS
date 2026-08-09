import { DefaultError, useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorktimeSlotApi } from '../api/restaurants';
import { RestaurantData } from '../types/restaurantDataType';
import { showSuccessToast } from '../services/toaster';
import { useTranslation } from 'react-i18next';

type CreateWorktimeSlotData = {
    type: 'all' | 'delivery' | 'pickup';
    reason: string;
    duration?: number;
};

export default () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const showSuccessMessage = (type: CreateWorktimeSlotData['type'], restaurant: string) => {
        const getTranslatedMessage = (key: string) => t('orders.live_orders_settings.restaurant.' + key, { restaurant });
        switch (type) {
            case 'delivery':
                showSuccessToast(getTranslatedMessage('delivery_paused_for'));
                break;
            case 'pickup':
                showSuccessToast(getTranslatedMessage('pick_up_paused_for'));
                break;
            case 'all':
                showSuccessToast(getTranslatedMessage('restaurant_closed_message'));
                break;
        }
    };

    return useMutation<RestaurantData, DefaultError, CreateWorktimeSlotData>({
        mutationFn: (variables) => createWorktimeSlotApi(variables.type, variables.reason, variables.duration),
        onSuccess: (restaurantData, variables) => {
            queryClient.setQueryData(['restaurant'], restaurantData);
            showSuccessMessage(variables.type, restaurantData.name);
        }
    });
};
