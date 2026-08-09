import { WorktimeSlot } from '../types/worktimeSlotType';
import { DefaultError, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteWorkTimeSlotApi } from '../api/restaurants';
import { RestaurantData } from '../types/restaurantDataType';
import { showSuccessToast } from '../services/toaster';
import { useTranslation } from 'react-i18next';

type DeleteWorktimeSlotData = {
    slot: WorktimeSlot;
};

export default () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const showSuccessMessage = (type: WorktimeSlot['type'], restaurant: string) => {
        const getTranslatedMessage = (key: string) => t('orders.live_orders_settings.restaurant.' + key, { restaurant });
        switch (type) {
            case 'delivery':
                showSuccessToast(getTranslatedMessage('delivery_is_available_for'));
                break;
            case 'pickup':
                showSuccessToast(getTranslatedMessage('pick_up_is_available_for'));
                break;
            case 'all':
                showSuccessToast(getTranslatedMessage('restaurant_is_open'));
                break;
        }
    };

    return useMutation<RestaurantData, DefaultError, DeleteWorktimeSlotData>({
        mutationFn: (variables) => deleteWorkTimeSlotApi(variables.slot.slot_id),
        onSuccess: (restaurant, variables) => {
            queryClient.setQueryData(['restaurant'], restaurant);
            showSuccessMessage(variables.slot.type, restaurant.name);
        }
    });
};
