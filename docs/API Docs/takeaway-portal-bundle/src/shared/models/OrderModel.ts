import { differenceInMinutes, differenceInSeconds, endOfToday, isAfter, isToday } from 'date-fns';
import { CourierType, Customer, OrderData, OrderPayment, OrderPaymentType, Product } from '../types/orderDataType';
import { orderStatus } from '../enums/orderStatusesEnum';
import { DELIVERY, PAYMENT_TYPES, PICKUP } from '../constants';
import RestaurantModel from './RestaurantModel';
import { TFunction } from 'i18next';
import { getWaitingForCourierTitle } from '../helpers/order/getWaitingForCourierTitle';

export default class OrderModel {
    readonly id!: number;
    readonly public_reference!: string;
    readonly placed_date!: Date;
    readonly requested_time!: Date | null;
    readonly customer!: Customer | undefined;
    readonly currency!: string;
    readonly products!: Product[];
    readonly couriers!: CourierType[];
    readonly status!: orderStatus;
    readonly payment_type!: OrderPaymentType;
    readonly payment?: OrderPayment;
    readonly delivery_type!: string;
    readonly discounts_total!: number;
    readonly stampcards_total!: number;
    readonly delivery_fee!: number;
    readonly service_fee!: number;
    readonly small_order_fee!: number | null;
    readonly customer_total!: number;
    readonly subtotal!: number;
    readonly restaurant_total!: number;
    readonly remarks!: string;
    readonly created_at!: Date;
    readonly with_alcohol!: boolean;
    readonly is_ready_for_kitchen?: boolean;
    readonly has_failure_alert!: boolean;
    readonly global_id!: string | null;
    readonly confirmed_at!: Date | null;

    readonly restaurant_estimated_pickup_time!: Date | null;
    readonly delivery_service_pickup_time!: Date | null;
    readonly restaurant_estimated_delivery_time!: Date | null; // this is filled when just eat order arrives
    readonly delivery_service_delivery_time!: Date | null;

    readonly food_preparation_duration?: null | number | undefined;
    readonly delivery_time_duration?: null | number | undefined;

    constructor(data: OrderData) {
        Object.entries(data).forEach(([key, value]) => {
            (this as any)[key] = value;
        });
    }

    // Statuses
    get is_new(): boolean {
        return this.status === orderStatus.NEW;
    }

    get is_confirmed(): boolean {
        return this.status === orderStatus.CONFIRMED;
    }

    get is_in_kitchen(): boolean {
        return this.status === orderStatus.KITCHEN;
    }

    get is_in_delivery(): boolean {
        return this.status === orderStatus.IN_DELIVERY;
    }

    get is_delivered(): boolean {
        return this.status === orderStatus.DELIVERED;
    }

    get is_cancelled(): boolean {
        return this.status === orderStatus.CANCELLED;
    }

    // Times
    get acceptance_time(): number {
        return differenceInSeconds(Date.now(), this.created_at);
    }

    get pickup_time(): Date | null {
        return this.delivery_service_pickup_time || this.restaurant_estimated_pickup_time;
    }

    get delivery_time(): Date | null {
        return this.delivery_service_delivery_time || this.restaurant_estimated_delivery_time;
    }

    get minutes_until_preorder(): number {
        return this.requested_time ? differenceInMinutes(this.requested_time, new Date()) : 0;
    }

    // Types
    get is_asap(): boolean {
        return this.requested_time === null;
    }

    get is_preorder(): boolean {
        return this.requested_time !== null;
    }

    get is_pickup(): boolean {
        return this.delivery_type === PICKUP;
    }

    get is_delivery(): boolean {
        return this.delivery_type === DELIVERY;
    }

    get is_scheduled(): boolean {
        return (
            this.requested_time !== null &&
            isToday(this.requested_time) &&
            differenceInMinutes(this.requested_time, new Date()) > 90
        );
    }

    get is_next_day_scheduled(): boolean {
        return this.requested_time !== null && isAfter(this.requested_time, endOfToday());
    }

    // Other
    get has_unavailable_products(): boolean {
        return this.products.some((product) => product.is_available === false);
    }

    is_waiting_for_courier(restaurant: RestaurantModel): boolean {
        return restaurant.is_unified_order_flow && this.is_confirmed && this.is_ready_for_kitchen !== true;
    }

    get is_paid(): boolean {
        return this.customer_total <= (this.payment?.already_paid_amount || 0) || this.payment_type === PAYMENT_TYPES.ONLINE;
    }

    get_courier_title(restaurant: RestaurantModel, t: TFunction): string | undefined {
        const courier = this.couriers?.[0];
        return this.is_cancelled || !this.is_delivery
            ? undefined
            : courier?.full_name
              ? courier.full_name
              : restaurant.is_unified_order_flow && this.is_delivery
                ? getWaitingForCourierTitle(this, t)
                : undefined;
    }
}
