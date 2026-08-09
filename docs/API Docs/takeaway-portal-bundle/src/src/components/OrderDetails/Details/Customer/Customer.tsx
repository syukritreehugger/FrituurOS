import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion } from '@jet-pie/react';
import { ChevronDown, ChevronUp, PhoneFilled } from '@jet-pie/react/esm/icons';
import CensoredText from '../../../UI/CensoredText/CensoredText';
import { colors } from '../../../../common/js/colorTokens';
import { OrderModel, RestaurantModel } from '@lo/shared/models';
import { trainingElements } from '@lo/shared/types/trainings';
import useTrainingControl from '@lo/shared/hooks/useTrainingControl';
import usePhoneMasking from '@lo/shared/hooks/usePhoneMasking';
import { useTutorial } from '@lo/web/hooks/useTutorial';
import Tutorial from '../../../Tutorial/Tutorial';
import classes from './Customer.module.scss';

type CustomerProps = {
    order: OrderModel;
    hideSensitiveInformation: boolean;
    restaurant: RestaurantModel;
};

const Customer: React.FC<CustomerProps> = ({ order, restaurant, hideSensitiveInformation }) => {
    const { t } = useTranslation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { getTutorialRef, ...tutorial } = useTutorial('phoneMasking');
    const { visiblePhoneNumber, phoneMaskingCode } = usePhoneMasking(order);

    const customer = order.customer;
    const ChevronIcon = isCollapsed ? ChevronDown : ChevronUp;

    useTrainingControl('orderContact', { show: () => setIsCollapsed(false) });

    if (!customer) return null;

    const header = (
        <button className={classes.customerButton} data-testid="customer-button" onClick={() => setIsCollapsed(!isCollapsed)}>
            <p className={classes.name}>{customer.full_name}</p>
            <ChevronIcon width={14} height={14} fill={colors.alias.contentBrand} />
        </button>
    );

    const content = (
        <>
            {visiblePhoneNumber && (
                <div ref={getTutorialRef()} className={classes.phoneContainer}>
                    <div className={classes.phone}>
                        <PhoneFilled />
                        <span data-training-id={trainingElements.orderContact} data-testid="order-details-address-phone">
                            {visiblePhoneNumber}
                        </span>
                    </div>

                    {phoneMaskingCode && (
                        <>
                            <Tutorial {...tutorial} enabled={!isCollapsed} />
                            <div className={classes.phoneMaskingCode}>
                                <b>{t('orders.live_orders_order_details.titles.verification_code')}:</b>
                                <span data-testid="order-details-address-phone-masking-code">{phoneMaskingCode}</span>
                            </div>
                        </>
                    )}
                </div>
            )}

            {customer.company_name && restaurant.is_address_visible && !hideSensitiveInformation && (
                <p data-testid="order-details-address-company-name">
                    {t('orders.live_orders_order_details.titles.company')}: {customer.company_name}
                </p>
            )}
        </>
    );

    return (
        <div className={classes.customer}>
            {hideSensitiveInformation ? (
                <CensoredText />
            ) : (
                <Accordion variant="custom" isCollapsed={isCollapsed} header={header} content={content} />
            )}
        </div>
    );
};

export default Customer;
