import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRestaurantStatus } from '@lo/shared/hooks/useRestaurantStatus';
import { Banner, Button } from '@jet-pie/react';
import classes from './RestaurantStatusBanner.module.scss';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { useNavigate } from 'react-router';

const RestaurantStatusBanner: React.FC = () => {
    const { t } = useTranslation();
    const restaurant = useRestaurant();
    const navigate = useNavigate();
    const { isClosed, isDeliveryClosed, isPickupClosed, openRestaurant, minutesLeft, deliveryMinutesLeft, pickupMinutesLeft } =
        useRestaurantStatus();

    const handleDeleteWorkTimeSlot = () => {
        if (isPickupClosed && isDeliveryClosed) {
            navigate('/settings');
        } else {
            openRestaurant();
        }
    };

    const statusMessageMap = {
        all: t('orders.live_orders_settings.restaurant.restaurant_is_closed', { restaurant: restaurant.name }),
        pickup: t('orders.live_orders_settings.restaurant.pick_up_paused'),
        delivery: t('orders.live_orders_settings.restaurant.delivery_paused')
    };

    const getReturnTimeMessage = (minutes: number) =>
        minutes <= 60
            ? t('orders.live_orders_settings.restaurant.back_in_minutes', { minutes })
            : t('orders.live_orders_settings.restaurant.back_tomorrow');

    return (
        <>
            {isClosed && minutesLeft && (
                <Banner title={statusMessageMap.all} data-testid="restaurant-status-banner" variant="warning">
                    <p className={classes.message}>{getReturnTimeMessage(minutesLeft)}</p>
                    <Button
                        data-testid="restaurant-status-banner-open"
                        onClick={handleDeleteWorkTimeSlot}
                        variant="primary"
                        size="xSmall"
                    >
                        <p className={classes.buttonText}>{t('orders.live_orders_navigation.menu.settings')}</p>
                    </Button>
                </Banner>
            )}
            {!isClosed && isPickupClosed && pickupMinutesLeft && (
                <Banner title={statusMessageMap.pickup} data-testid="pickup-status-banner" variant="warning">
                    <p className={classes.message}>{getReturnTimeMessage(pickupMinutesLeft)}</p>
                    <Button
                        data-testid="pickup-status-banner-resume"
                        onClick={handleDeleteWorkTimeSlot}
                        variant="primary"
                        size="xSmall"
                    >
                        <p className={classes.buttonText}>{t('orders.live_orders_settings.restaurant.resume')}</p>
                    </Button>
                </Banner>
            )}
            {!isClosed && isDeliveryClosed && deliveryMinutesLeft && (
                <Banner title={statusMessageMap.delivery} data-testid="delivery-status-banner" variant="warning">
                    <p className={classes.message}>{getReturnTimeMessage(deliveryMinutesLeft)}</p>
                    <Button
                        data-testid="delivery-status-banner-resume"
                        onClick={handleDeleteWorkTimeSlot}
                        variant="primary"
                        size="xSmall"
                    >
                        <p className={classes.buttonText}>{t('orders.live_orders_settings.restaurant.resume')}</p>
                    </Button>
                </Banner>
            )}
        </>
    );
};

export default RestaurantStatusBanner;
