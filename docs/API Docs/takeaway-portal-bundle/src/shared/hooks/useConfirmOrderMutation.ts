import { DefaultError, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { updateOrderInOrdersQuery } from '@lo/shared/services/query';
import { confirmOrderApi } from '@lo/shared/api/orders';
import { showSuccessToast } from '@lo/shared/services/toaster';
import { OrderData } from '../types/orderDataType';
import useRestaurant from './useRestaurant';
import { useOrdersStoreActions } from '../store/orders';
import analytics from '@lo/shared/services/analytics';
import { OrderModel } from '../models';

export default () => {
    const restaurant = useRestaurant();
    const actions = useOrdersStoreActions();
    const { t } = useTranslation();

    return useMutation<
        OrderData,
        DefaultError,
        { order: OrderModel; cookingTime: number | null; deliveryDurationTime: number | null; estimatedDeliveryTime: Date | null }
    >({
        mutationFn: ({ order, cookingTime, deliveryDurationTime, estimatedDeliveryTime }) => {
            return confirmOrderApi({
                id: order.id,
                cookingTime,
                deliveryDurationTime,
                estimatedDeliveryTime
            });
        },
        onMutate(variables) {
            actions.manuallyChangedOrderStatus(variables.order.id); // To save order id in 'manually changed' list

            if (variables.order.is_new) {
                analytics.orders.confirmedOrder(variables.order);
            } else {
                analytics.orders.updatedConfirmedOrder(variables.order);
            }

            const selectedCookingDurationDiff = (variables.cookingTime || 0) - restaurant.food_preparation_duration;

            if (selectedCookingDurationDiff !== 0) {
                analytics.orders.changedOrderDuration('cook', selectedCookingDurationDiff, variables.order);
            }

            const selectedDeliveryDurationDiff = (variables.deliveryDurationTime || 0) - restaurant.average_delivery_duration;

            if (variables.order.is_delivery && selectedDeliveryDurationDiff !== 0) {
                analytics.orders.changedOrderDuration('delivery', selectedDeliveryDurationDiff, variables.order);
            }
        },
        onSuccess: (newOrderData) => {
            showSuccessToast(t('orders.live_orders_messages.main.thanks_for_confirming'), {
                toastId: `order-${newOrderData.id}`
            });

            updateOrderInOrdersQuery(newOrderData);
        }
    });
};
