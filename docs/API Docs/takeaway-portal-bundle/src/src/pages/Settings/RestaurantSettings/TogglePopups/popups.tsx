import { CloseRestaurantEvent } from '@lo/shared/hooks/useRestaurantStatus';
import React from 'react';
import { useTranslation } from 'react-i18next';
import TogglePopupBase from './TogglePopupBase';
import { RestaurantModel } from '@lo/shared/models';

type TogglePopupBaseProps = {
    restaurant: RestaurantModel;
    isClosed: boolean;
    minutesLeft?: number;
    closeRestaurant: CloseRestaurantEvent;
    openRestaurant: () => void;
    isPauseModalOpen?: boolean;
};

export const RestaurantTogglePopup: React.FC<TogglePopupBaseProps> = (props) => {
    const { restaurant, isClosed, minutesLeft, openRestaurant, closeRestaurant, isPauseModalOpen } = props;
    const { t } = useTranslation();

    return (
        <TogglePopupBase
            toggleType="all"
            testID="restaurant-popup"
            isClosed={isClosed}
            minutesLeft={minutesLeft}
            restaurant={restaurant}
            closeRestaurant={closeRestaurant}
            openRestaurant={openRestaurant}
            heading={t('orders.live_orders_settings.restaurant.restaurant_status')}
            title={t('orders.live_orders_settings.restaurant.close_restaurant_title')}
            closedTitle={t('orders.live_orders_settings.restaurant.ready_to_reopen')}
            subtitle={t('orders.live_orders_settings.restaurant.close_restaurant_subtitle')}
            reasonSelectTitle={t('orders.live_orders_settings.restaurant.specify_the_reason')}
            timeSelectTitle={t('orders.live_orders_settings.restaurant.open_again_in')}
            confirmButtonTitle={t('orders.live_orders_settings.restaurant.close_now')}
            toggleOpenedTitle={t('orders.live_orders_settings.restaurant.open')}
            toggleClosedTitle={t('orders.live_orders_settings.restaurant.closed')}
            toggleTitle={t('orders.live_orders_settings.settings_page.restaurant')}
            isPauseModalOpen={isPauseModalOpen}
        />
    );
};

export const DeliveryTogglePopup: React.FC<TogglePopupBaseProps> = (props) => {
    const { restaurant, isClosed, minutesLeft, openRestaurant, closeRestaurant } = props;
    const { t } = useTranslation();

    return (
        <TogglePopupBase
            toggleType="delivery"
            testID="delivery-popup"
            isClosed={isClosed}
            minutesLeft={minutesLeft}
            restaurant={restaurant}
            closeRestaurant={closeRestaurant}
            openRestaurant={openRestaurant}
            heading={t('orders.live_orders_settings.restaurant.delivery_status')}
            title={t('orders.live_orders_settings.restaurant.pause_delivery_heading')}
            closedTitle={t('orders.live_orders_settings.restaurant.ready_to_delivery')}
            subtitle={t('orders.live_orders_settings.restaurant.pause_delivery_info')}
            reasonSelectTitle={t('orders.live_orders_settings.restaurant.specify_the_reason')}
            timeSelectTitle={t('orders.live_orders_settings.restaurant.start_delivery_again_in')}
            confirmButtonTitle={t('orders.live_orders_settings.restaurant.pause_delivery')}
            toggleOpenedTitle={t('orders.live_orders_settings.restaurant.available_status')}
            toggleClosedTitle={t('orders.live_orders_settings.restaurant.paused_status')}
            toggleTitle={t('orders.live_orders_order_list.delivery_types.delivery')}
        />
    );
};

export const PickUpTogglePopup: React.FC<TogglePopupBaseProps> = (props) => {
    const { restaurant, isClosed, minutesLeft, openRestaurant, closeRestaurant } = props;
    const { t } = useTranslation();

    return (
        <TogglePopupBase
            toggleType="pickup"
            testID="pickup-popup"
            isClosed={isClosed}
            minutesLeft={minutesLeft}
            restaurant={restaurant}
            closeRestaurant={closeRestaurant}
            openRestaurant={openRestaurant}
            heading={t('orders.live_orders_settings.restaurant.pick_up_status')}
            title={t('orders.live_orders_settings.restaurant.pause_pick_up_heading')}
            closedTitle={t('orders.live_orders_settings.restaurant.ready_to_pick_up')}
            subtitle={t('orders.live_orders_settings.restaurant.pause_pick_up_info')}
            reasonSelectTitle={t('orders.live_orders_settings.restaurant.specify_the_reason')}
            timeSelectTitle={t('orders.live_orders_settings.restaurant.start_pick_up_again_in')}
            confirmButtonTitle={t('orders.live_orders_settings.restaurant.pause_pick_up')}
            toggleOpenedTitle={t('orders.live_orders_settings.restaurant.available_status')}
            toggleClosedTitle={t('orders.live_orders_settings.restaurant.paused_status')}
            toggleTitle={t('orders.live_orders_order_list.delivery_types.pick_up')}
        />
    );
};
