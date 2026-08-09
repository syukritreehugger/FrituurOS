import React, { FC } from 'react';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import JustEatConfirmation from './JustEatConfirmation/JustEatConfirmation';
import { OrderModel } from '@lo/shared/models';
import TakeawayConfirmation from './TakeawayConfirmation/TakeawayConfirmation';
import classes from './OrderDetailsConfirmation.module.scss';

type OrderDetailsConfirmationProps = {
    order: OrderModel;
    printReceipt: () => void;
    hidePrintButton: boolean;
    isUpdatingConfirmedTimes: boolean;
    toggleUpdateConfirmedTimes: () => void;
};

const OrderDetailsConfirmation: FC<OrderDetailsConfirmationProps> = (props) => {
    const { order, printReceipt, hidePrintButton, isUpdatingConfirmedTimes, toggleUpdateConfirmedTimes } = props;

    const restaurant = useRestaurant();

    return (
        <div className={classes.container} data-testid="order-details-confirm-container">
            {restaurant.is_just_eat ? (
                <JustEatConfirmation restaurant={restaurant} order={order} />
            ) : (
                <TakeawayConfirmation
                    restaurant={restaurant}
                    order={order}
                    hidePrintButton={hidePrintButton}
                    printReceipt={printReceipt}
                    isUpdatingConfirmedTimes={isUpdatingConfirmedTimes}
                    toggleUpdateConfirmedTimes={toggleUpdateConfirmedTimes}
                />
            )}
        </div>
    );
};

export default OrderDetailsConfirmation;
