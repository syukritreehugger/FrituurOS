import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import DeliveryDisplaySettings from './DeliveryDisplaySettings/DeliveryDisplaySettings';
import ReceiptSettings from './ReceiptSettings/ReceiptSettings';
import RestaurantSettings from './RestaurantSettings/RestaurantSettings';
import OrderListSettings from './OrderListSettings/OrderListSettings';
import SoundSettings from './SoundSettings/SoundSettings';
import PinCodeSettings from './PinCodeSettings/PinCodeSettings';
import TutorialsSettings from './TutorialsSettings/TutorialsSettings';
import Tutorial from '@lo/web/components/Tutorial/Tutorial';
import SettingsBlock from './SettingsBlock/SettingsBlock';
import DefaultTimeSettings from './DefaultTimeSettings/DefaultTimeSettings';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import classes from './Settings.module.scss';
import { isProduction } from '@lo/shared/helpers/isProduction';
import DebugSettings from './DebugSettings/DebugSettings';
import { useTutorial } from '@lo/web/hooks/useTutorial';
import { useSearchParams } from 'react-router';

const Settings: React.FC = () => {
    const restaurant = useRestaurant();
    const settingsRef = useRef<HTMLDivElement | null>(null);
    const { t } = useTranslation();
    const { getTutorialRef, ...tutorial } = useTutorial('settings');
    const [searchParams, _] = useSearchParams();

    const showDefaultCookingTimePicker = restaurant.can_change_default_cooking_duration;
    const showDefaultDeliveryTimePicker = restaurant.can_change_default_delivery_duration;

    return (
        <div className={classes.wrapper}>
            <Tutorial {...tutorial} />

            <div className={classes.page}>
                <div className={classes.headingContainer}>
                    <h4>{t('orders.live_orders_settings.restaurant.main_title')}</h4>
                    <p className={classes.title}>{t('orders.live_orders_settings.settings_page.title')}</p>
                </div>

                <main className={classes.main} ref={settingsRef}>
                    <div className={classNames(classes.column, classes.left)}>
                        <div ref={getTutorialRef('restaurant_settings')}>
                            {restaurant.allow_close && (
                                <SettingsBlock title={t('orders.live_orders_settings.settings_page.restaurant')}>
                                    <RestaurantSettings
                                        restaurant={restaurant}
                                        isPauseModalOpen={searchParams.get('openPauseModal') === 'true'}
                                    />
                                </SettingsBlock>
                            )}

                            {!restaurant.is_just_eat && (showDefaultCookingTimePicker || showDefaultDeliveryTimePicker) && (
                                <SettingsBlock title={t('orders.live_orders_settings.restaurant.time_title')}>
                                    <DefaultTimeSettings
                                        restaurant={restaurant}
                                        showDefaultCookingTimePicker={showDefaultCookingTimePicker}
                                        showDefaultDeliveryTimePicker={showDefaultDeliveryTimePicker}
                                    />
                                </SettingsBlock>
                            )}
                        </div>

                        {!restaurant.is_just_eat && (
                            <SettingsBlock title={t('orders.live_orders_pin.main.pin_settings')}>
                                <PinCodeSettings restaurant={restaurant} />
                            </SettingsBlock>
                        )}

                        <SettingsBlock title={t('orders.live_orders_settings.tutorials.heading')}>
                            <TutorialsSettings restaurant={restaurant} />
                        </SettingsBlock>

                        {!isProduction() && (
                            <SettingsBlock title="Debug">
                                <DebugSettings />
                            </SettingsBlock>
                        )}
                    </div>

                    <div className={classNames(classes.column, classes.right)}>
                        <div ref={getTutorialRef('display_settings')}>
                            <SettingsBlock title={t('orders.live_orders_order_list.other.delivery_display_settings')}>
                                <DeliveryDisplaySettings restaurant={restaurant} />
                            </SettingsBlock>

                            <SettingsBlock title={t('orders.live_orders_settings.settings_page.receipt_settings')}>
                                <ReceiptSettings restaurant={restaurant} />
                            </SettingsBlock>
                        </div>
                        <div ref={getTutorialRef('order_list_settings')}>
                            <SettingsBlock title={t('orders.live_orders_settings.settings_page.orders_list_settings')}>
                                <OrderListSettings restaurant={restaurant} />
                            </SettingsBlock>
                            <SettingsBlock title={t('orders.live_orders_settings.settings_page.sound_settings_title')} isLast>
                                <SoundSettings restaurant={restaurant} />
                            </SettingsBlock>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;
