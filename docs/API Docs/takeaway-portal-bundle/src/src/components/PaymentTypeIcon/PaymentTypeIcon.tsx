import React, { FC } from 'react';
import {
    AccountCreditLarge,
    CashLarge,
    ChequeLarge,
    CreditCardLarge,
    GiftCardLarge,
    MealVoucherLarge,
    PinAtHomeLarge,
    TakeawayPayLarge,
    VoucherLarge
} from '@jet-pie/react/esm/icons';
import { Tooltip } from '@jet-pie/react/esm/components/Tooltip';
import { PAYMENT_TYPES } from '@lo/shared/constants';
import getPaymentTypeTitle from '@lo/shared/helpers/order/getOrderPaymentTitle';
import { OrderPaymentType } from '@lo/shared/types/orderDataType';

type PaymentTypeIconProps = {
    paymentType: OrderPaymentType;
    size?: number;
    fill?: string;
    showTooltip?: boolean;
};

const PaymentTypeIcon: FC<PaymentTypeIconProps> = ({ paymentType, fill, showTooltip, size = 24 }) => {
    const getIcon = () => {
        switch (paymentType) {
            case PAYMENT_TYPES.CASH:
                return CashLarge;
            case PAYMENT_TYPES.CHEQUE:
                return ChequeLarge;
            case PAYMENT_TYPES.CREDITCARD:
            case PAYMENT_TYPES.CREDITCARD_AT_HOME:
            case PAYMENT_TYPES.DEBITCARD:
            case PAYMENT_TYPES.DEBITCARD_AT_HOME:
                return CreditCardLarge;
            case PAYMENT_TYPES.MEAL_VOUCHER:
            case PAYMENT_TYPES.MEAL_VOUCHER_AT_HOME:
                return MealVoucherLarge;
            case PAYMENT_TYPES.PIN_AT_HOME:
                return PinAtHomeLarge;
            case PAYMENT_TYPES.VOUCHER:
                return VoucherLarge;
            case PAYMENT_TYPES.GIFT_CARD:
                return GiftCardLarge;
            case PAYMENT_TYPES.TAKEAWAY_PAY:
            case PAYMENT_TYPES.JET_PAY:
                return TakeawayPayLarge;
            case PAYMENT_TYPES.ACCOUNT_CREDIT:
                return AccountCreditLarge;
            default:
                return CreditCardLarge; // Fallback icon
        }
    };

    const Icon = getIcon();

    return showTooltip ? (
        <Tooltip content={getPaymentTypeTitle(paymentType)} placement="top" yOffset={8}>
            <Icon width={size} height={size} fill={fill} />
        </Tooltip>
    ) : (
        <Icon width={size} height={size} fill={fill} />
    );
};

export default PaymentTypeIcon;
