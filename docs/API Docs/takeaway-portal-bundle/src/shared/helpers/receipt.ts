import { toZonedTime } from 'date-fns-tz';
import { RestaurantModel } from '../models';
import { Product, Specification } from '../types/orderDataType';

export const formatTime = (date: Date | null, restaurantTimezone: string) => {
    return date && toZonedTime(date, restaurantTimezone).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

export const formatTotal = (total: number, currency: string) => {
    return `${currency} ${total.toFixed(2).replace('.', ',')}`;
};

export const getItemCode = (item: Product | Specification, restaurant: RestaurantModel) => {
    if (!restaurant.receipt_settings.product_id_enabled) {
        return null;
    }

    let code = restaurant.gtins_enabled && item.gtin ? item.gtin : item.code;

    if (code) {
        code = code.slice(0, restaurant.receipt_settings.product_id_length || 5);
    }

    return code ? `(#${code})` : null;
};
