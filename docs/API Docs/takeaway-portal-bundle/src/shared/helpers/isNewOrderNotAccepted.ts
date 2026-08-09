import { differenceInSeconds } from 'date-fns';
import OrderModel from '../models/OrderModel';

export const isNewOrderNotAccepted = (orders: OrderModel[]): boolean | void => {
    return orders.some((order) => {
        if (!order.is_new) return false;

        const timePassed = differenceInSeconds(new Date(), order.created_at);
        const difference = timePassed % 120; // get diff every 120s
        return timePassed > 5 && (difference < 5 || difference > 115);
    });
};
