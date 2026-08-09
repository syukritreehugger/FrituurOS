import { TFunction } from 'i18next';
import { NavigationType } from '../types/navigationType';

export const getMenuItems: (t: TFunction, applyJustEatFilter?: boolean) => NavigationType = (
    t: TFunction,
    applyJustEatFilter?: boolean
) => {
    const navigation: NavigationType = {
        home: {
            title: t('orders.live_orders_navigation.menu.home'),
            items: [{ name: t('orders.live_orders_navigation.menu.home'), route: '/orders' }],
            icon: 'House'
        },
        menu: {
            title: t('orders.live_orders_menu.main.heading'),
            items: [{ name: t('orders.live_orders_menu.main.heading'), route: '/menu' }],
            icon: 'RestaurantMenu'
        },
        orderHistory: {
            title: t('orders.live_orders_navigation.menu.order_history'),
            items: [{ name: t('orders.live_orders_navigation.menu.order_history'), route: '/history' }],
            icon: 'Calendar'
        },
        settings: {
            title: t('orders.live_orders_navigation.menu.settings'),
            items: [{ name: t('orders.live_orders_navigation.menu.settings'), route: '/settings' }],
            icon: 'Settings'
        }
    };

    if (applyJustEatFilter) delete navigation.menu;
    return navigation;
};
