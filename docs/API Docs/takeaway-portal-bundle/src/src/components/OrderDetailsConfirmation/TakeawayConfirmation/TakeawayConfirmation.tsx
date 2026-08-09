import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Printer from '@jet-pie/react/esm/icons/Printer';
import useConfirmTakeawayOrder from '@lo/shared/hooks/useConfirmTakeawayOrder';
import { OrderModel, RestaurantModel } from '@lo/shared/models';
import { colors } from '../../../common/js/colorTokens';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import ConfirmButton from '../ConfirmButton/ConfirmButton';
import ConfirmOrderMessage from '../ConfirmOrderMessage/ConfirmOrderMessage';
import ChangeTimeItem from '../../ChangeTimeItem/ChangeTimeItem';
import classes from './TakeawayConfirmation.module.scss';
import { trainingElements } from '@lo/shared/types/trainings';

type TakeawayConfirmationProps = {
    restaurant: RestaurantModel;
    order: OrderModel;
    isUpdatingConfirmedTimes: boolean;
    toggleUpdateConfirmedTimes: () => void;
    printReceipt: () => void;
    hidePrintButton: boolean;
};

const TakeawayConfirmation: FC<TakeawayConfirmationProps> = (props) => {
    const { restaurant, order, isUpdatingConfirmedTimes, toggleUpdateConfirmedTimes, printReceipt, hidePrintButton } = props;

    const { isLessThanTabletWidth } = useWindowSize();
    const { t } = useTranslation();

    const {
        cookingDuration,
        setCookingDuration,
        deliveryDuration,
        setDeliveryDuration,
        canIncreaseCookingDuration,
        canIncreaseDeliveryDuration,
        isLoading,
        onConfirm
    } = useConfirmTakeawayOrder(order, () => {
        isUpdatingConfirmedTimes && toggleUpdateConfirmedTimes();
    });

    const showDeliveryDurationTimeBlock = restaurant.can_change_delivery_duration_of_order(order);
    const showCookingTimeBlock = restaurant.can_change_cooking_duration_of_order(order);

    const CookingTimeBlock: React.FC = () => (
        <ChangeTimeItem
            name={t('orders.live_orders_order_details.confirmation.cooking_takes')}
            dataTestId={'food-preparation-duration'}
            value={cookingDuration}
            onDecrease={() => setCookingDuration(cookingDuration - 5)}
            onIncrease={() => setCookingDuration(cookingDuration + 5)}
            isDisabledDecrease={cookingDuration <= 5}
            isDisabledIncrease={!canIncreaseCookingDuration}
        />
    );

    const DeliveryDurationTimeBlock: React.FC = () => (
        <ChangeTimeItem
            name={t('orders.live_orders_order_details.confirmation.delivery_takes')}
            dataTestId={'delivery-duration'}
            value={deliveryDuration}
            onDecrease={() => setDeliveryDuration(deliveryDuration - 5)}
            onIncrease={() => setDeliveryDuration(deliveryDuration + 5)}
            isDisabledDecrease={deliveryDuration <= 5}
            isDisabledIncrease={!canIncreaseDeliveryDuration}
        />
    );

    const hasTimeBlocks = showCookingTimeBlock || showDeliveryDurationTimeBlock;

    return (
        <>
            {hasTimeBlocks && (
                <div className={classes.confirmTimesBlock} data-training-id={trainingElements.changeConfirmedTime}>
                    {showCookingTimeBlock && <CookingTimeBlock />}
                    {showDeliveryDurationTimeBlock && <DeliveryDurationTimeBlock />}
                </div>
            )}

            <div className={classes.confirmButtonBlock}>
                {restaurant.is_grocery_unified_flow && !isLessThanTabletWidth && !hidePrintButton && (
                    <button
                        className={classes.printIconButton}
                        onClick={printReceipt}
                        data-testid="print-groceries-order-receipt"
                    >
                        <Printer width={30} height={30} fill={colors.alias.contentBrand} />
                    </button>
                )}

                <ConfirmButton isLoading={isLoading} onClick={onConfirm} />

                {restaurant.show_restaurant_settings_text && <ConfirmOrderMessage />}
            </div>
        </>
    );
};

export default TakeawayConfirmation;
