import { OrderModel, RestaurantModel } from '@lo/shared/models';

export default function useReceiptAddressPermissions(
    restaurant: RestaurantModel,
    order: OrderModel,
    visiblePhoneNumber?: string
) {
    // TODO: This should be a more generic setting for restaurant, but for now it's provided as receipt settings
    const isCourierAppEnabled = restaurant.receipt_settings.hide_street_number;
    const isOwnDelivery = restaurant.is_own_delivery;
    const isPickup = order.is_pickup;
    const showCustomerPhoneNumber = !!visiblePhoneNumber && restaurant.country_contact_information.code !== 'sk';

    return {
        showAddress: isOwnDelivery,
        showStreetNumber: isOwnDelivery && !isCourierAppEnabled,
        showCustomerPhoneNumber: showCustomerPhoneNumber && (isPickup || !isOwnDelivery || !isCourierAppEnabled),
        showCompanyName: isOwnDelivery && !isCourierAppEnabled,
        showExtras: isOwnDelivery && !isCourierAppEnabled,
        showTaxId: !!order.customer?.tax_id && isOwnDelivery && !isCourierAppEnabled
    };
}
