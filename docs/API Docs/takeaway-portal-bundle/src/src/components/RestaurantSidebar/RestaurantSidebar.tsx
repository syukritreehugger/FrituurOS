import React, { useEffect, useState } from 'react';
import classes from './RestaurantSidebar.module.scss';
import { useTranslation } from 'react-i18next';
import { logout } from '@lo/shared/services/auth';
import classNames from 'classnames';
import { AVAILABLE_LANGUAGES } from '@lo/shared/constants';
import { LanguageSelector } from './LanguageSelector/LanguageSelector';
import { ChainRestaurantSelector } from './ChainRestaurantSelector/ChainRestaurantSelector';
import useChainRestaurants from '@lo/shared/hooks/useChainRestaurants';
import LocationPinRestaurant from '@jet-pie/react/esm/icons/LocationPinRestaurant';
import LogOut from '@jet-pie/react/esm/icons/LogOut';
import { languageFlagsMap } from '../../common/js/languageFlags';
import RestaurantLogo from '../RestaurantLogo/RestaurantLogo';
import { IconButton, SideSheet } from '@jet-pie/react';
import { Close } from '@jet-pie/react/esm/icons';
import { useRestaurantStatus } from '@lo/shared/hooks/useRestaurantStatus';
import queryClient from '@lo/shared/services/query/queryClient';
import { RestaurantModel } from '@lo/shared/models';
import { useOrdersStoreActions } from '@lo/shared/store/orders';
import { useIsChainAccount } from '@lo/shared/store/auth';
import { toast } from 'react-toastify';
import disableWebPushNotifications from '@lo/shared/helpers/notification/disableWebPushNotifications';

type RestaurantSidebarProps = {
    isOpen: boolean;
    restaurant: RestaurantModel;
    toggleSidebar: () => void;
};

const RestaurantSidebar: React.FC<RestaurantSidebarProps> = ({ isOpen, toggleSidebar, restaurant }) => {
    const { t, i18n } = useTranslation();
    const isChainAccount = useIsChainAccount();
    const { isClosed: isRestaurantClosed } = useRestaurantStatus();
    const { data: chainRestaurantData } = useChainRestaurants();
    const actions = useOrdersStoreActions();
    const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem('lang') || 'en');

    const [showChainSelector, toggleShowChainSelector] = useState(false);
    const [showLanguagesSelector, toggleShowLanguagesSelector] = useState(false);

    const restaurantStatus = !isRestaurantClosed
        ? t('orders.live_orders_settings.restaurant.open')
        : t('orders.live_orders_settings.restaurant.closed');

    const hasMultipleRestaurants = chainRestaurantData?.length && (isChainAccount || chainRestaurantData.length > 1);

    useEffect(() => {
        if (!isOpen) {
            toggleShowChainSelector(false);
            toggleShowLanguagesSelector(false);
        }
    }, [isOpen]);

    const handleRestaurantChange = async (id: number) => {
        toggleShowChainSelector(false);
        const selectedRestaurantId = restaurant.id;

        if (id === selectedRestaurantId) return;

        const selectedRestaurant = chainRestaurantData!.find((item) => item.id === id)!;
        const reference = selectedRestaurant.reference.toString();

        sessionStorage.setItem('selectedRestaurantId', reference);
        localStorage.setItem('selectedRestaurantId', reference);

        await disableWebPushNotifications();
        await queryClient.resetQueries({ queryKey: ['restaurant'] });
        actions.closeOrderDetails();
        toast.dismiss();
    };

    const handleLanguageChange = (locale: string): void => {
        toggleShowLanguagesSelector(false);
        setCurrentLanguage(locale);
        i18n.changeLanguage(locale);
    };

    const LanguageFlagIcon = languageFlagsMap[currentLanguage];

    return restaurant ? (
        <SideSheet
            id="restaurantSideSheet"
            data-testid="restaurant-sidebar"
            isOpen={isOpen}
            onShowSideSheet={toggleSidebar}
            title={t('orders.live_orders_settings.settings_page.restaurant') ?? 'Restaurant'}
            orientation="right"
            width="342px"
            hideOnOutsideClick
            hideHeader
            backdrop
        >
            <div className={classes.header}>
                <IconButton icon={<Close />} variant="ghost-tertiary" onClick={toggleSidebar} size="small" />
                <RestaurantLogo restaurant={restaurant} />
            </div>

            <div className={classes.container}>
                {hasMultipleRestaurants ? (
                    <ChainRestaurantSelector
                        onChange={handleRestaurantChange}
                        isOpen={showChainSelector}
                        close={() => toggleShowChainSelector(false)}
                    />
                ) : null}
                <LanguageSelector
                    onChange={handleLanguageChange}
                    isOpen={showLanguagesSelector}
                    close={() => toggleShowLanguagesSelector(false)}
                />

                <div>
                    <div className={classes.mainInfo}>
                        <div className={classes.name}>{restaurant.name}</div>
                        <div className={classes.reference}>{restaurant.reference}</div>
                    </div>
                    {restaurantStatus && (
                        <div className={classes.statusSwitcher}>
                            <div>
                                {t('orders.live_orders_settings.restaurant.restaurant_status')}:
                                <span className={classes.currentStatus}>{restaurantStatus}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    {hasMultipleRestaurants ? (
                        <>
                            <button
                                className={classNames(classes.menuItem, classes.withRightArrow)}
                                onClick={() => toggleShowChainSelector(true)}
                                data-testid="chain-restaurant-switcher"
                            >
                                <div className={classes.menuItemIcon}>
                                    <LocationPinRestaurant width={20} height={20} />
                                </div>
                                {t('orders.live_orders_navigation.chains.select_restaurant')}
                            </button>
                            <div className={classes.divider} />
                        </>
                    ) : null}

                    <button
                        className={classNames(classes.menuItem, classes.withRightArrow, classes[currentLanguage])}
                        onClick={() => toggleShowLanguagesSelector(true)}
                        data-testid="language-switcher"
                    >
                        <LanguageFlagIcon className={classes.languageItemFlag} />
                        {AVAILABLE_LANGUAGES[currentLanguage]}
                    </button>

                    <div className={classes.divider} />

                    <button className={classes.menuItem} onClick={() => logout()} data-testid="logout-button">
                        <div className={classes.menuItemIcon}>
                            <LogOut width={20} height={20} />
                        </div>
                        {t('orders.live_orders_navigation.menu.logout')}
                    </button>
                </div>
            </div>
        </SideSheet>
    ) : null;
};

export default RestaurantSidebar;
