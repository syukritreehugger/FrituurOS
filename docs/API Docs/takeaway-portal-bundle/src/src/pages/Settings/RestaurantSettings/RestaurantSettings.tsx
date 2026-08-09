import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeliveryTogglePopup, PickUpTogglePopup, RestaurantTogglePopup } from './TogglePopups/popups';
import { useRestaurantStatus } from '@lo/shared/hooks/useRestaurantStatus';
import classes from './RestaurantSettings.module.scss';
import { RestaurantModel } from '@lo/shared/models';

type RestaurantSettingsProps = {
    restaurant: RestaurantModel;
    isPauseModalOpen: boolean;
};

const RestaurantSettings: React.FC<RestaurantSettingsProps> = (props) => {
    const { restaurant, isPauseModalOpen = false } = props;
    const { t } = useTranslation();

    const showRestaurantOpenToggle = !restaurant.restaurant_settings.is_emergency_closed && restaurant.allow_close;
    const {
        isClosed,
        isDeliveryClosed,
        isPickupClosed,
        minutesLeft,
        deliveryMinutesLeft,
        pickupMinutesLeft,
        openRestaurant,
        closeRestaurant
    } = useRestaurantStatus();

    return (
        <>
            {showRestaurantOpenToggle && (
                <>
                    <p className={classes.openCloseInfoMessage}>
                        {t('orders.live_orders_messages.main.open_close_during_opening_hours')}
                    </p>

                    <RestaurantTogglePopup
                        restaurant={restaurant}
                        isClosed={isClosed}
                        minutesLeft={minutesLeft}
                        openRestaurant={openRestaurant}
                        closeRestaurant={closeRestaurant}
                        isPauseModalOpen={isPauseModalOpen}
                    />
                    {restaurant.can_toggle_delivery && (
                        <DeliveryTogglePopup
                            restaurant={restaurant}
                            isClosed={isDeliveryClosed}
                            minutesLeft={deliveryMinutesLeft}
                            openRestaurant={() => openRestaurant('delivery')}
                            closeRestaurant={closeRestaurant}
                        />
                    )}
                    <PickUpTogglePopup
                        restaurant={restaurant}
                        isClosed={isPickupClosed}
                        minutesLeft={pickupMinutesLeft}
                        openRestaurant={() => openRestaurant('pickup')}
                        closeRestaurant={closeRestaurant}
                    />
                </>
            )}
        </>
    );
};
export default RestaurantSettings;
