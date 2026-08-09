import { TFunction } from 'i18next';
import { capitalize } from '@lo/shared/helpers/string/capitalize';
import { CourierType } from '../../types/orderDataType';
import { OrderModel, RestaurantModel } from '../../models';

type UseOrderDetailsHeaderReturnValue = {
    title?: string;
    showCourier: boolean;
    courier?: CourierType;
    deliveryTypeTitle: string;
};
type GetOrderDetailsHeaderData = (
    order: OrderModel,
    restaurant: RestaurantModel,
    t: TFunction
) => UseOrderDetailsHeaderReturnValue;

export const getOrderDetailsHeaderData: GetOrderDetailsHeaderData = (order, restaurantData, t) => {
    const uiSettings = restaurantData.ui_settings;
    const isAddressHidden =
        !uiSettings.show_customer_address || order.is_pickup || (restaurantData && !restaurantData.is_address_visible);

    const postcode = uiSettings.show_customer_postcode && order.customer ? order.customer.postcode : '';

    const city = uiSettings.show_customer_city && order.customer ? (postcode && ' ') + order.customer.city : '';

    const street = order.customer ? `${order.customer?.street} ${order.customer?.street_number}` : '';

    const title = !isAddressHidden
        ? `${postcode}${city}${(postcode || city) && street && ', '}${street}`
        : order.customer?.full_name;

    const courier = order.couriers?.[0];
    const showCourier = !!courier && !!courier.full_name && order.is_delivery;

    const deliveryTypeTitle = order.is_delivery
        ? capitalize(t('orders.live_orders_order_list.delivery_types.delivery'))
        : capitalize(t('orders.live_orders_order_list.delivery_types.pick_up'));

    return { title, showCourier, courier: showCourier ? courier : undefined, deliveryTypeTitle };
};
