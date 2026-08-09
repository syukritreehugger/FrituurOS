import i18n from '../localization/i18n';

export type TutorialId =
    | 'menuList'
    | 'orderHistory'
    | 'orderHistoryOFL'
    | 'orderList'
    | 'settings'
    | 'notifications'
    | 'orderDetails'
    | 'phoneMasking';

type Step = {
    title?: string;
    intro: string;
    position?: string;
};

type TutorialsConfig = () => Record<TutorialId, Record<string, Step>>;

export const getTutorialsConfig: TutorialsConfig = () => ({
    menuList: {
        default: {
            title: i18n.t('orders.live_orders_tutorials.steps.menu_list_heading') || undefined,
            intro: i18n.t('orders.live_orders_tutorials.steps.menu_list_description'),
            position: 'top'
        }
    },
    orderHistory: {
        default: {
            title: i18n.t('orders.live_orders_order_history.tutorial.title') || undefined,
            intro: i18n.t('orders.live_orders_order_history.tutorial.content'),
            position: 'bottom'
        }
    },
    orderHistoryOFL: {
        default: {
            title: i18n.t('orders.live_orders_order_history.tutorial.title') || undefined,
            intro: i18n.t('orders.live_orders_order_history.tutorial.content'),
            position: 'bottom'
        }
    },
    orderList: {
        default: {
            title: i18n.t('orders.live_orders_tutorials.steps.order_status_heading') || undefined,
            intro: i18n.t('orders.live_orders_tutorials.steps.order_status_description')
        }
    },
    settings: {
        restaurant_settings: {
            title: i18n.t('orders.live_orders_tutorials.steps.settings_heading') || undefined,
            intro: i18n.t('orders.live_orders_tutorials.steps.settings_description')
        },
        display_settings: {
            title: i18n.t('orders.live_orders_tutorials.steps.settings_heading') || undefined,
            intro: i18n.t('orders.live_orders_tutorials.steps.display_settings_description')
        },
        order_list_settings: {
            title: i18n.t('orders.live_orders_tutorials.steps.settings_heading') || undefined,
            intro: i18n.t('orders.live_orders_tutorials.steps.personalization_settings_description')
        }
    },
    notifications: {
        default: {
            title: i18n.t('orders.live_orders_tutorials.steps.notifications_heading') || undefined,
            intro: i18n.t('orders.live_orders_tutorials.steps.notifications_description')
        }
    },
    orderDetails: {
        default: {
            title: i18n.t('orders.live_orders_tutorials.steps.order_details_heading') || undefined,
            intro: i18n.t('orders.live_orders_tutorials.steps.order_details_description')
        }
    },
    phoneMasking: {
        default: {
            title: undefined,
            intro: i18n.t('orders.live_orders_tutorials.steps.phone_masking')
        }
    }
});
