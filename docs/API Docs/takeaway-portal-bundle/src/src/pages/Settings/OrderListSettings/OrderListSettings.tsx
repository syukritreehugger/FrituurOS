import React from 'react';
import { useTranslation } from 'react-i18next';
import ToggleBlock from '../ToggleBlock/ToggleBlock';
import { RestaurantModel } from '@lo/shared/models';

type OrderListSettingsProps = {
    restaurant: RestaurantModel;
};

const OrderListSettings: React.FC<OrderListSettingsProps> = (props) => {
    const { t } = useTranslation();
    const { restaurant } = props;

    return (
        <div>
            <ToggleBlock
                settingType="ui"
                settingName="show_sorting"
                message={t('orders.live_orders_settings.restaurant.show_sorting')}
                isSwitcherOn={restaurant.ui_settings.show_sorting}
            />

            <ToggleBlock
                settingType="ui"
                settingName="show_product_id"
                message={t('orders.live_orders_settings.restaurant.show_product_id')}
                isSwitcherOn={restaurant.ui_settings.show_product_id}
            />

            <ToggleBlock
                settingType="ui"
                settingName="show_product_categories"
                message={t('orders.live_orders_settings.restaurant.show_product_categories')}
                isSwitcherOn={restaurant.ui_settings.show_product_categories}
            />
        </div>
    );
};

export default OrderListSettings;
