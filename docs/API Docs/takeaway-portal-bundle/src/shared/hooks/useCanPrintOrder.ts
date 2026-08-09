import useRestaurant from './useRestaurant';
import OrderModel from '../models/OrderModel';
import { useIsChainAccount } from '../store/auth';

export default (order: OrderModel | null | undefined): { canPrint: boolean; canAutoPrint: boolean } => {
    const isChainAccount = useIsChainAccount();
    const restaurant = useRestaurant();

    if (!order) return { canPrint: false, canAutoPrint: false };

    let canPrint = true;

    if (isChainAccount) {
        canPrint = false;
    } else if (order.is_new && !restaurant.is_unified_order_flow && !restaurant.is_grocery_unified_flow) {
        canPrint = false;
    } else if (order.is_confirmed) {
        canPrint = true;
    }

    return {
        canPrint,
        canAutoPrint: canPrint && restaurant.receipt_settings.auto_print_enabled
    };
};
