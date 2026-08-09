import useConfirmOrder from '@lo/shared/hooks/useConfirmOrderMutation';
import { OrderModel } from '@lo/shared/models';
import { useEffect, useState } from 'react';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { differenceInMinutes, differenceInSeconds, addMinutes } from 'date-fns';
import { showWarningToast } from '@lo/shared/services/toaster';
import { useTranslation } from 'react-i18next';

const STEP = 5;
const MAX_ALLOWED_DURATION = 50;

const useConfirmTakeawayOrder = (order: OrderModel, setUpdatingConfirmedTimes: (value: boolean) => void) => {
    const restaurant = useRestaurant();
    const { t } = useTranslation();
    const mutation = useConfirmOrder();

    const [cookingDuration, setCookingDuration] = useState(restaurant.food_preparation_duration);
    const [deliveryDuration, setDeliveryDuration] = useState(order.is_pickup ? 0 : restaurant.average_delivery_duration);

    useEffect(() => {
        const defaultValuesAreValid =
            order.requested_time &&
            differenceInMinutes(
                order.requested_time,
                restaurant.food_preparation_duration + restaurant.average_delivery_duration
            ) >= 0;

        if (order.is_preorder && !defaultValuesAreValid) {
            const maximumAllowedTime =
                order.minutes_until_preorder > 0 ? Math.floor(order.minutes_until_preorder / 2 / STEP) * STEP : 0;

            setCookingDuration(maximumAllowedTime);
            !order.is_pickup && setDeliveryDuration(maximumAllowedTime);
        }
    }, [order.requested_time]);

    const canIncreaseCookingDuration = () => {
        if (order.is_asap || !order.requested_time) {
            return cookingDuration < MAX_ALLOWED_DURATION;
        }

        return differenceInSeconds(order.requested_time, addMinutes(new Date(), cookingDuration + deliveryDuration)) >= 0;
    };

    const canIncreaseDeliveryDuration = () => {
        if (order.is_asap || !order.requested_time) {
            return deliveryDuration < MAX_ALLOWED_DURATION;
        }

        return differenceInSeconds(order.requested_time, addMinutes(new Date(), cookingDuration + deliveryDuration)) >= 0;
    };

    const valuesAreValid = () => {
        if (order.is_preorder && order.requested_time) {
            return differenceInSeconds(order.minutes_until_preorder, cookingDuration + deliveryDuration) >= 0;
        }

        return true;
    };

    const onConfirm = () => {
        if (valuesAreValid()) {
            mutation.mutate({
                order,
                cookingTime: cookingDuration,
                deliveryDurationTime: deliveryDuration,
                estimatedDeliveryTime: null
            });
            setUpdatingConfirmedTimes(false);
        } else {
            showWarningToast(t('orders.live_orders_messages.main.confirmation_use_different_time'));
        }
    };

    return {
        isLoading: mutation.isPending,
        cookingDuration,
        deliveryDuration,
        canIncreaseCookingDuration: canIncreaseCookingDuration(),
        canIncreaseDeliveryDuration: canIncreaseDeliveryDuration(),
        setCookingDuration,
        setDeliveryDuration,
        onConfirm
    };
};

export default useConfirmTakeawayOrder;
