import { useQuery } from '@tanstack/react-query';
import { convertCurrencyApi } from '../api/currency';
import { OrderModel } from '../models';
import useRestaurant from './useRestaurant';

export default function useConvertCustomerTotal(order: OrderModel) {
    const restaurant = useRestaurant();

    const shouldConvert = restaurant.country_contact_information.code === 'bg' && order.currency === 'BGN';

    const query = useQuery({
        queryKey: ['bgTotalConvert', order.customer_total],
        queryFn: () => convertCurrencyApi({ from: 'BGN', to: 'EUR', amount: order.customer_total }),
        enabled: shouldConvert
    });

    return {
        shouldConvert,
        convertedCustomerTotal: query.data?.amount,
        conversionRate: query.data && `1 EUR = ${query.data.rate} BGN`
    };
}
