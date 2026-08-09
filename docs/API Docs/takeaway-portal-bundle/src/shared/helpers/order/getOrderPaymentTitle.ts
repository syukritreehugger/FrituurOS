import i18n from '@lo/shared/localization/i18n';
import { OrderPaymentType } from '../../types/orderDataType';
import { PAYMENT_TYPES } from '../../constants';

const getOrderPaymentTypeTitle = (paymentType: OrderPaymentType): string => {
    switch (paymentType) {
        case PAYMENT_TYPES.CASH:
            return i18n.t('orders.live_orders_receipt.main.payment_cash');
        case PAYMENT_TYPES.PIN_AT_HOME:
            return i18n.t('orders.live_orders_receipt.main.payment_pinathome');
        case PAYMENT_TYPES.CREDITCARD_AT_HOME:
            return i18n.t('orders.live_orders_receipt.main.payment_mobilecreditcard');
        case PAYMENT_TYPES.CHEQUE:
            return i18n.t('orders.live_orders_receipt.main.payment_cheque');
        case PAYMENT_TYPES.MEAL_VOUCHER:
            return i18n.t('orders.live_orders_receipt.main.payment_mealvoucher');
        case PAYMENT_TYPES.ONLINE:
            return i18n.t('orders.live_orders_receipt.main.payment_online');
        default:
            return paymentType.charAt(0).toUpperCase() + paymentType.slice(1);
    }
};

export default getOrderPaymentTypeTitle;
