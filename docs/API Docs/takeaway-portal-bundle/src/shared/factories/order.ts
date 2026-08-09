import { OrderData } from '../types/orderDataType';
import { orderStatus } from '../enums/orderStatusesEnum';
import { makeProduct } from './product';
import { OrderModel } from '../models';

export const makeOrderData = (fields: Partial<OrderData> = {}): OrderData => {
    return {
        id: Math.floor(Math.random() * 1000),
        public_reference: `#${Math.random().toString(36).substring(2, 8)}`,
        created_at: new Date('2020-09-22T19:00:46Z'),
        status: orderStatus.NEW,
        placed_date: new Date('2020-09-22T19:00:46Z'),
        delivery_type: 'delivery',
        requested_time: new Date('2020-09-21T19:46:46Z'),
        payment_type: 'visa',
        restaurant_estimated_pickup_time: new Date('2020-09-21T20:46:46Z'),
        delivery_service_pickup_time: null,
        restaurant_estimated_delivery_time: null,
        delivery_service_delivery_time: null,
        remarks: 'Please place your comment here',
        subtotal: 11.0,
        delivery_fee: 2.0,
        service_fee: 3.0,
        small_order_fee: 2.0,
        discounts_total: 1.2,
        restaurant_total: 13.0,
        customer_total: 16.0,
        stampcards_total: 2.4,
        customer: {
            full_name: 'John Doe',
            street: 'Burgemeester Edo Bergsmalaan',
            street_number: '37',
            postcode: '8888AA',
            city: 'Enschede',
            phone_number: '8898896685',
            display_phone_number: '1234567890',
            phone_masking_code: '123456',
            company_name: 'Test Company',
            extra: ['floor: 123', 'test']
        },
        currency: 'CHF',
        products: [makeProduct()],
        couriers: [
            {
                full_name: 'Anis Kilov',
                avatar: ''
            }
        ],
        with_alcohol: true,
        has_failure_alert: false,
        global_id: 'global id',
        ...fields
    };
};

export const makeOrder = (fields: Partial<OrderData> = {}): OrderModel => {
    return new OrderModel(makeOrderData(fields));
};
