import { orderStatus } from './enums/orderStatusesEnum';
import { OrderPaymentType } from './types/orderDataType';

export const APP_STORE_LINK = 'https://apps.apple.com/app/live-orders/id1562296823';
export const GOOGLE_PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.justeattakeaway.liveorders';

export const COURIER_THEN_RESTAURANT = 'courier_then_restaurant';
export const SCOOBER_UNIFIED_FLOW = 'scoober_unified_flow';
export const GROCERY_UNIFIED_FLOW = 'grocery_unified_flow';
export const UNIFIED_POS_FLOW = 'scoober_unified_flow_pos';
export const THIRD_PARTY_GROCERY_FLOW = 'third_party_logistics_grocery_flow';

export const ASAP = 'asap';
export const DELIVERY = 'delivery';
export const PICKUP = 'pickup';

export const PAYMENT_TYPES = {
    CASH: 'cash',
    CHEQUE: 'cheque',
    CREDITCARD: 'creditcard',
    CREDITCARD_AT_HOME: 'home_creditcard',
    DEBITCARD: 'debitcard',
    DEBITCARD_AT_HOME: 'home_debitcard',
    JET_PAY: 'jetpay',
    MEAL_VOUCHER: 'meal_voucher',
    MEAL_VOUCHER_AT_HOME: 'mealVoucher',
    ONLINE: 'online',
    PIN_AT_HOME: 'pinAtHome',
    TAKEAWAY_PAY: 'takeawayPay',
    VOUCHER: 'voucher',
    GIFT_CARD: 'giftCard',
    ACCOUNT_CREDIT: 'accountcredit',
    VISA: 'visa',
    MASTERCARD: 'mastercard'
} as const;

export const CARD_PAYMENT_TYPES_SET = [
    PAYMENT_TYPES.CREDITCARD,
    PAYMENT_TYPES.CREDITCARD_AT_HOME,
    PAYMENT_TYPES.DEBITCARD,
    PAYMENT_TYPES.DEBITCARD_AT_HOME,
    PAYMENT_TYPES.MASTERCARD,
    PAYMENT_TYPES.VISA,
    PAYMENT_TYPES.ONLINE
] as OrderPaymentType[];

export const AVAILABLE_LANGUAGES = {
    en: 'English',
    bg: 'Български',
    da: 'Dansk',
    de: 'Deutsch',
    es: 'Español',
    fr: 'Français',
    it: 'Italiano',
    nl: 'Nederlands',
    pl: 'Polski',
    ro: 'Română',
    sk: 'Slovenčina'
} as const;

export const AVAILABLE_TENANTS = {
    uk: 'https://live-orders.just-eat.uk',
    ie: 'https://live-orders.just-eat.ie',
    it: 'https://live-orders.just-eat.it',
    es: 'https://live-orders.just-eat.es',
    au: 'https://live-orders.just-eat.au',
    nz: 'https://live-orders.just-eat.nz'
} as const;

export const PARTNER_HUB_COUNTRIES = ['uk', 'au', 'at', 'dk', 'de', 'ie', 'it', 'nl', 'pl', 'es', 'ch', 'sk'] as const;

export const ORDER_STATUSES_SEQUENCE = [
    orderStatus.NEW,
    orderStatus.CONFIRMED,
    orderStatus.KITCHEN,
    orderStatus.IN_DELIVERY,
    orderStatus.DELIVERED,
    orderStatus.CANCELLED
] as const;

export const MIN_DEFAULT_TIME = 5;
export const MAX_DEFAULT_TIME = 50;

export const OFL_FEATURE = 'ofl_enabled';
export const ONE_MENU_FEATURE = 'at3033-one-menu';
export const OFL_MOBILE_FEATURE = 'ofl-mobile-enabled';

export const SOUND_NAMES = [
    'default',
    'airhorn',
    'bladerunner',
    'bong',
    'bumptious',
    'doorbell_notification',
    'doorbell',
    'banjo',
    'radio',
    'signal_ring',
    'alert1',
    'alert2',
    'alert3',
    'warning'
] as const;
