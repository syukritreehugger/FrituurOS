import { OrderHistoryDataItem } from '../types/orderHistoryType';
import { format, isToday } from 'date-fns';
import { orderStatus } from '../enums/orderStatusesEnum';
import moneyFormat from '../helpers/moneyFormat';
import { OrderPaymentType } from '../types/orderDataType';

class OrderHistoryItemModel {
    readonly id!: number;
    readonly public_reference!: string;
    readonly cancelled_at!: Date | null;
    readonly placed_date!: Date;
    readonly currency!: string;
    readonly restaurant_total!: number;
    readonly status!: string;
    readonly delivery_type!: 'delivery' | 'pickup';
    readonly payment_type!: OrderPaymentType;
    readonly customer?: {
        readonly full_name: string;
        readonly street: string;
        readonly street_number: string;
    };

    constructor(data: OrderHistoryDataItem) {
        Object.entries(data).forEach(([key, value]) => {
            (this as any)[key] = value;
        });
    }

    get time() {
        return format(this.placed_date, isToday(this.placed_date) ? 'HH:mm' : 'd LLL');
    }

    get address() {
        return this.customer && this.customer.street && `${this.customer?.street} ${this.customer?.street_number}`;
    }

    get total() {
        return moneyFormat(this.restaurant_total, this.currency);
    }

    get is_cash() {
        return this.payment_type === 'cash';
    }

    get is_pickup() {
        return this.delivery_type === 'pickup';
    }

    get is_cancelled() {
        return !!this.cancelled_at;
    }

    get is_in_progress() {
        return !this.cancelled_at && this.status !== orderStatus.DELIVERED;
    }
}

export default OrderHistoryItemModel;
