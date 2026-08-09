import { DefaultError, useMutation } from '@tanstack/react-query';
import { queryClient, updateOrderInOrdersQuery } from '@lo/shared/services/query';
import { OrderData } from '../types/orderDataType';
import { updateOrderStatusApi } from '../api/orders';
import useRestaurant from './useRestaurant';
import { useOrdersStoreActions } from '../store/orders';
import analytics from '@lo/shared/services/analytics';
import { orderStatus } from '../enums/orderStatusesEnum';
import useOFLExperiment from './useOFLExperiment';
import { showSuccessToast } from '../services/toaster';
import { useTranslation } from 'react-i18next';
import { OrderModel } from '../models';

const useUpdateOrderStatus = (props: { onSuccess?: (newStatus: orderStatus) => void } = {}) => {
    const restaurant = useRestaurant();
    const actions = useOrdersStoreActions();
    const { isOFL } = useOFLExperiment();
    const { t } = useTranslation();

    return useMutation<OrderData, DefaultError, { id: number; status: orderStatus }>({
        mutationFn: updateOrderStatusApi,
        onMutate: ({ id, status }) => {
            actions.manuallyChangedOrderStatus(id); // To save order id in 'manually changed' list

            const orders = queryClient.getQueryData<Map<number, OrderModel>>(['orders', restaurant.id]);
            const order = orders?.get(id) as OrderModel;
            const currentStatus = order.status;

            if (status === orderStatus.DELIVERED) {
                analytics.orders.deliveredOrder(order);
                return;
            }

            if (status === orderStatus.IN_DELIVERY) {
                analytics.orders.movedOrderToInDelivery(order);
                return;
            }

            if (currentStatus === orderStatus.IN_DELIVERY && status === orderStatus.KITCHEN) {
                analytics.orders.movedOrderBackToKitchen(order);
                return;
            }
        },
        onSuccess: (updatedOrderData, { status }) => {
            if (isOFL && status === orderStatus.IN_DELIVERY) {
                showSuccessToast(
                    t('orders.live_orders_messages.main.moved_to_handover', { orderId: updatedOrderData.public_reference })
                );
            }

            if (isOFL && status === orderStatus.DELIVERED) {
                showSuccessToast(
                    t('orders.live_orders_messages.main.moved_to_done', { orderId: updatedOrderData.public_reference })
                );
            }

            updateOrderInOrdersQuery(updatedOrderData);

            actions.closeOrderDetails();

            props.onSuccess?.(updatedOrderData.status);
        }
    });
};

export default useUpdateOrderStatus;
