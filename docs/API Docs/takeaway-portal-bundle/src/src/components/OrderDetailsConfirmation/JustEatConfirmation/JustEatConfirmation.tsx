import React, { FC } from 'react';
import { formatTime } from '@lo/shared/helpers/formatTime';
import useConfirmJustEatOrder from '@lo/shared/hooks/useConfirmJustEatOrder';
import { OrderModel, RestaurantModel } from '@lo/shared/models';
import { useTranslation } from 'react-i18next';
import Bike from '@jet-pie/react/esm/icons/Bike';
import ChangeTimeItem from '../../ChangeTimeItem/ChangeTimeItem';
import { differenceInMinutes } from 'date-fns';
import classes from './JustEatConfirmation.module.scss';
import ConfirmButton from '../ConfirmButton/ConfirmButton';

type JustEatConfirmationProps = {
    restaurant: RestaurantModel;
    order: OrderModel;
};

const JustEatConfirmation: FC<JustEatConfirmationProps> = ({ restaurant, order }) => {
    const { isLoading, onConfirm, estimatedDeliveryTime, canDecrease, onDecrease, canIncrease, onIncrease } =
        useConfirmJustEatOrder(order);
    const { t } = useTranslation();

    const getValue = (): number | string | null => {
        if (estimatedDeliveryTime === null) return null;

        return order.is_asap
            ? differenceInMinutes(estimatedDeliveryTime, new Date())
            : formatTime(estimatedDeliveryTime, 'HH:mm', restaurant.timezone);
    };

    return (
        <>
            {order.is_preorder && restaurant.is_just_eat_rds && (
                <div className={classes.justEatPreorderRdsTimeBlock}>
                    <div className={classes.justEatPreorderRdsTimeText}>
                        {t('orders.live_orders_order_details.titles.requested_delivery_time')}
                        &nbsp;
                        {formatTime(estimatedDeliveryTime, 'HH:mm', restaurant.timezone)}
                    </div>
                </div>
            )}

            {!restaurant.is_just_eat_rds && (
                <ChangeTimeItem
                    name={t('orders.live_orders_order_details.confirmation.delivery_takes')}
                    dataTestId={'delivery-duration'}
                    value={getValue()}
                    onDecrease={onDecrease}
                    onIncrease={onIncrease}
                    icon={<Bike width={22} height={22} />}
                    isDisabledDecrease={!canDecrease}
                    isDisabledIncrease={!canIncrease}
                    labelText={order.is_preorder ? '' : 'min'}
                />
            )}

            <div className={classes.confirmOrder}>
                <ConfirmButton isLoading={isLoading} onClick={onConfirm} />
            </div>
        </>
    );
};

export default JustEatConfirmation;
