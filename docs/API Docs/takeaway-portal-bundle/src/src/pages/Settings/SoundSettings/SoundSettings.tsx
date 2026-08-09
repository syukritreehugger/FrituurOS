import React from 'react';
import { useTranslation } from 'react-i18next';
import SoundSetting from './SoundSetting/SoundSetting';
import { RestaurantModel } from '@lo/shared/models';

type SoundSettingsProps = {
    restaurant: RestaurantModel;
};

const SoundSettings: React.FC<SoundSettingsProps> = (props) => {
    const { restaurant } = props;
    const { t } = useTranslation();

    return (
        restaurant && (
            <>
                <SoundSetting
                    name="incoming_order_sound"
                    value={restaurant.ui_settings.incoming_order_sound}
                    heading={t('orders.live_orders_settings.settings_page.incoming_order_sound_title')}
                    description={t('orders.live_orders_settings.settings_page.incoming_order_sound_description')}
                />
                <SoundSetting
                    name="order_update_sound"
                    value={restaurant.ui_settings.order_update_sound}
                    heading={t('orders.live_orders_settings.settings_page.order_update_sound_title')}
                    description={t('orders.live_orders_settings.settings_page.order_update_sound_description')}
                />
                <SoundSetting
                    name="other_notification_sound"
                    value={restaurant.ui_settings.other_notification_sound}
                    heading={t('orders.live_orders_settings.settings_page.other_notifications_sound_title')}
                    description={t('orders.live_orders_settings.settings_page.other_notifications_sound_description')}
                />
            </>
        )
    );
};

export default SoundSettings;
