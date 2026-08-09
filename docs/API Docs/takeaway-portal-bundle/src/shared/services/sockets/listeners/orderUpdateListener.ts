import { shouldIgnoreOrderUpdate } from '../../../helpers/order/shouldIgnoreOrderUpdate';
import { showOrderUpdateNotification } from '../../../helpers/order/showOrderUpdateNotification';
import { playSound } from '../../../helpers/playSound';
import queryClient from '../../query/queryClient';
import i18n from '../../../localization/i18n';
import { showSuccessToast } from '../../toaster';
import { OrderModel, RestaurantModel } from '../../../models';
import { OrderData } from '../../../types/orderDataType';
import { RestaurantData } from '../../../types/restaurantDataType';
import { useOrdersStore } from '../../../store/orders';
import { useLocalNotificationsStore } from '../../../store/localNotifications';
import { updateOrdersInOrdersQuery } from '../../query';
import transformEntityTimeToDateObjects from '../../../helpers/transformEntityTimeToDateObjects';
import batchExecutor from '../../../helpers/batchExecutor';

const addToBatch = batchExecutor<OrderModel>(async (newOrders) => {
    const restaurantData = queryClient.getQueryData<RestaurantData>(['restaurant']) as RestaurantData;
    const restaurant = new RestaurantModel(restaurantData);
    const ordersState = useOrdersStore.getState();
    const orders = queryClient.getQueryData<Map<number, OrderModel>>(['orders', restaurant.id]) ?? new Map();
    const ordersForUpdate = [] as OrderModel[];

    newOrders.forEach((newOrder) => {
        const orderToUpdate = orders.get(newOrder.id);

        if (orderToUpdate === undefined || shouldIgnoreOrderUpdate(orderToUpdate, newOrder, restaurant)) {
            return;
        }

        ordersForUpdate.push(newOrder);

        const orderWasManuallyUpdated = ordersState.manuallyChangedOrderIds.includes(newOrder.id);
        const needToShowNotification = showOrderUpdateNotification(newOrder, orderToUpdate);

        // Do not notify if order was updated manually previously
        if (!orderWasManuallyUpdated && needToShowNotification && restaurant) {
            showSuccessToast(
                i18n.t('orders.live_orders_messages.main.orderid_has_been_updated', { orderId: newOrder.public_reference }),
                {
                    onShow: () => playSound(restaurant.ui_settings.order_update_sound || 'default'),
                    toastId: typeof document === 'undefined' ? 'order-update' : `order-${newOrder.id}` // Don't stack toasts on mobile
                }
            );
        }

        ordersState.actions.receivedOrderUpdateFromSockets(newOrder.id);

        if (newOrder.is_cancelled) {
            ordersState.actions.orderCancelled(newOrder.public_reference);

            return;
        }

        const courierAdded = newOrder.is_in_kitchen && newOrder.couriers.length > orderToUpdate.couriers.length;
        const orderIsReadyForKitchen = newOrder.is_ready_for_kitchen && !orderToUpdate.is_ready_for_kitchen;

        if (courierAdded || orderIsReadyForKitchen) {
            const notificationsState = useLocalNotificationsStore.getState();
            notificationsState.actions.pushNotification(restaurant.reference, 'PrepareOrder', newOrder);

            return;
        }
    });

    updateOrdersInOrdersQuery(ordersForUpdate);
});

export default function orderUpdateListener(newOrderData: OrderData) {
    const newOrder = new OrderModel(transformEntityTimeToDateObjects(newOrderData));
    addToBatch(newOrder);
}
