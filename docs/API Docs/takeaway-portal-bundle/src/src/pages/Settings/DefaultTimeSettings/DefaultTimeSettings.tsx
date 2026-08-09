import React from 'react';
import ChangeTimeItem from '@lo/web/components/ChangeTimeItem/ChangeTimeItem';
import { MAX_DEFAULT_TIME, MIN_DEFAULT_TIME } from '@lo/shared/constants';
import { useTranslation } from 'react-i18next';
import classes from './DefaultTimeSettings.module.scss';
import useUpdateSetting from '@lo/shared/hooks/useUpdateSetting';
import { RestaurantModel } from '@lo/shared/models';

type DefaultTimeSettingsProps = {
    showDefaultCookingTimePicker: boolean;
    showDefaultDeliveryTimePicker: boolean;
    restaurant: RestaurantModel;
};

const DefaultTimeSettings: React.FC<DefaultTimeSettingsProps> = ({
    showDefaultDeliveryTimePicker,
    showDefaultCookingTimePicker,
    restaurant
}) => {
    const { t } = useTranslation();
    const updateSettingCookingDuration = useUpdateSetting('general', 'food_preparation_duration');
    const updateSettingDeliveryDuration = useUpdateSetting('general', 'average_delivery_duration');

    return (
        <>
            {showDefaultCookingTimePicker && (
                <div className={classes.item}>
                    <ChangeTimeItem
                        name={t('orders.live_orders_order_details.confirmation.cooking_takes')}
                        dataTestId="food-preparation-duration-config"
                        value={restaurant.food_preparation_duration || 0}
                        onDecrease={() => updateSettingCookingDuration.mutate(restaurant.food_preparation_duration - 5)}
                        onIncrease={() => updateSettingCookingDuration.mutate(restaurant.food_preparation_duration + 5)}
                        isDisabledDecrease={
                            updateSettingCookingDuration.isPending || restaurant.food_preparation_duration <= MIN_DEFAULT_TIME
                        }
                        isDisabledIncrease={
                            updateSettingCookingDuration.isPending || restaurant.food_preparation_duration >= MAX_DEFAULT_TIME
                        }
                    />
                </div>
            )}

            {showDefaultDeliveryTimePicker && (
                <div className={classes.item}>
                    <ChangeTimeItem
                        name={t('orders.live_orders_order_details.confirmation.delivery_takes')}
                        dataTestId="delivery-duration-config"
                        value={restaurant.average_delivery_duration || 0}
                        onDecrease={() => updateSettingDeliveryDuration.mutate(restaurant.average_delivery_duration - 5)}
                        onIncrease={() => updateSettingDeliveryDuration.mutate(restaurant.average_delivery_duration + 5)}
                        isDisabledDecrease={
                            updateSettingDeliveryDuration.isPending || restaurant.average_delivery_duration <= MIN_DEFAULT_TIME
                        }
                        isDisabledIncrease={
                            updateSettingDeliveryDuration.isPending || restaurant.average_delivery_duration >= MAX_DEFAULT_TIME
                        }
                    />
                </div>
            )}
        </>
    );
};

export default DefaultTimeSettings;
