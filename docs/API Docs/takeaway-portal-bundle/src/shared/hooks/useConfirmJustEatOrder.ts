import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addMinutes, subMinutes, differenceInMinutes } from 'date-fns';
import useConfirmOrderMutation from '@lo/shared/hooks/useConfirmOrderMutation';
import { OrderModel } from '@lo/shared/models';
import { showWarningToast } from '@lo/shared/services/toaster';

const STEP = 5;
const MAX_POSTPONE_TIME = 30;

const useConfirmJustEatOrder = (order: OrderModel) => {
    const mutation = useConfirmOrderMutation();
    const { t } = useTranslation();
    const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<Date | null>(order.restaurant_estimated_delivery_time);

    const canDecrease = () => {
        if (estimatedDeliveryTime === null || order.restaurant_estimated_delivery_time === null) return false;

        if (order.is_preorder) {
            return estimatedDeliveryTime > order.restaurant_estimated_delivery_time;
        }

        return differenceInMinutes(estimatedDeliveryTime, new Date()) - STEP > STEP;
    };

    const canIncrease = () => {
        if (estimatedDeliveryTime === null || order.restaurant_estimated_delivery_time === null) return false;

        if (order.is_asap || order.requested_time === null) {
            return differenceInMinutes(estimatedDeliveryTime, order.restaurant_estimated_delivery_time) < MAX_POSTPONE_TIME;
        }

        return differenceInMinutes(estimatedDeliveryTime, order.requested_time) < MAX_POSTPONE_TIME;
    };

    const onDecrease = () => {
        if (canDecrease()) {
            setEstimatedDeliveryTime((prevTime) => prevTime && subMinutes(prevTime, STEP));
        }
    };

    const onIncrease = () => {
        if (canIncrease()) {
            setEstimatedDeliveryTime((prevTime) => prevTime && addMinutes(prevTime, STEP));
        }
    };

    const isValid = () => {
        if (estimatedDeliveryTime === null) return false;

        if (order.is_preorder && order.requested_time) {
            return (
                differenceInMinutes(estimatedDeliveryTime, order.requested_time) >= 0 &&
                differenceInMinutes(estimatedDeliveryTime, order.requested_time) <= MAX_POSTPONE_TIME
            );
        }

        return true;
    };

    const onConfirm = () => {
        if (isValid()) {
            mutation.mutate({
                order,
                cookingTime: null,
                deliveryDurationTime: null,
                estimatedDeliveryTime
            });
        } else {
            showWarningToast(t('orders.live_orders_messages.main.confirmation_use_different_time'));
        }
    };

    return {
        estimatedDeliveryTime,
        isLoading: mutation.isPending,
        canDecrease: canDecrease(),
        canIncrease: canIncrease(),
        onDecrease,
        onIncrease,
        onConfirm
    };
};

export default useConfirmJustEatOrder;
