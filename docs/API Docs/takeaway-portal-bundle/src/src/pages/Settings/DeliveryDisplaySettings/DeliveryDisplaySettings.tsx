import React from 'react';
import ToggleBlock from '../ToggleBlock/ToggleBlock';
import { UISettingsType } from '@lo/shared/types/uiSettingsType';
import { useTranslation } from 'react-i18next';
import { RestaurantModel } from '@lo/shared/models';

type DeliveryDisplaySettingsProps = {
    restaurant: RestaurantModel;
};

const DeliveryDisplaySettings: React.FC<DeliveryDisplaySettingsProps> = (props) => {
    const { restaurant } = props;

    const { t } = useTranslation();

    const settingNames: Array<keyof UISettingsType> = ['show_order_reference', 'show_customer_name'];

    if (restaurant.is_address_visible) {
        settingNames.unshift('show_customer_address', 'show_customer_postcode', 'show_customer_city');
    }

    const activeSettingNames = settingNames.filter((name) => restaurant.ui_settings[name] !== false);
    const onlyOneSettingIsActive = activeSettingNames.length === 1;

    return (
        <div data-testid="delivery-display-settings">
            {settingNames.map((name) => {
                return (
                    <ToggleBlock
                        key={name}
                        settingType="ui"
                        settingName={name}
                        message={t(`orders.live_orders_settings.restaurant.${name}`)}
                        isSwitcherOn={restaurant.ui_settings[name] !== false}
                        disabled={onlyOneSettingIsActive && restaurant.ui_settings[name] !== false}
                    />
                );
            })}
        </div>
    );
};

export default DeliveryDisplaySettings;
