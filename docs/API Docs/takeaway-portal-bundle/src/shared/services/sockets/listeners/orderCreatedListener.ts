import batchExecutor from '../../../helpers/batchExecutor';
import { playSound } from '../../../helpers/playSound';
import i18n from '../../../localization/i18n';
import { OrderData } from '../../../types/orderDataType';
import { RestaurantData } from '../../../types/restaurantDataType';
import { queryClient, updateOrdersInOrdersQuery } from '../../query';
import { showInfoToast } from '../../toaster';

const addToBatch = batchExecutor<OrderData>(async (orders) => {
    const restaurantData = queryClient.getQueryData(['restaurant']) as RestaurantData;

    updateOrdersInOrdersQuery(orders);
    playSound(restaurantData.ui_settings.incoming_order_sound ?? 'default');
    showInfoToast(i18n.t('orders.live_orders_messages.main.you_received_new_order'), {
        toastId: 'new-order'
    });
});

export default function orderCreatedListener(newOrderData: OrderData) {
    addToBatch(newOrderData);
}
