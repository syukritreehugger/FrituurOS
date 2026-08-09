import { DefaultError, useMutation } from '@tanstack/react-query';
import { updateOrderInOrdersQuery } from '@lo/shared/services/query';
import { OrderData } from '../types/orderDataType';
import { createOrderIssueApi } from '../api/orders';
import { showSuccessToast } from '../services/toaster';
import { useTranslation } from 'react-i18next';
import { useOrdersStoreActions } from '../store/orders';

export default () => {
    const actions = useOrdersStoreActions();
    const { t } = useTranslation();

    return useMutation<OrderData, DefaultError, { id: number; partnerProductIds: string[]; menuProductIds: string[] }>({
        mutationFn: createOrderIssueApi,
        onMutate({ id }) {
            actions.manuallyChangedOrderStatus(id);
        },
        onSuccess: (orderData) => {
            showSuccessToast(
                t('orders.live_orders_messages.main.orderid_has_been_updated', { orderId: orderData.public_reference }),
                { toastId: `order-${orderData.id}` } // Providing custom toast id to avoid duplicates
            );
            updateOrderInOrdersQuery(orderData);
        }
    });
};
