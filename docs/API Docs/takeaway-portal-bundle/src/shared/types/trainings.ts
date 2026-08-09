export type ElementSearchStatus = 'searching' | 'found' | 'timeout';

export type ElementSearchResult = {
    element: Element | null;
    status: ElementSearchStatus;
};

export type TrainingStep = {
    id: string;
    title?: string;
    elementId?: string;
    onStart?: () => void;
    onComplete?: () => void;
    onBack?: () => void;
    onElementFound?: () => void;
};

export type Training = {
    id: string;
    timeToComplete: number;
    route?: string;
    steps: TrainingStep[];
};

export const trainingElements = {
    prepareTab: 'prepare-tab',
    handoverTab: 'handover-tab',
    doneTab: 'done-tab',
    deliveryTime: 'delivery-time',
    timeControls: 'time-controls',
    acceptOrder: 'accept-order',
    updateStatusButton: 'update-status-button',
    orderItem: 'order-item',
    orderDetails: 'order-details',
    orderDetailsActions: 'order-details-actions',
    orderContact: 'order-contact',
    orderProducts: 'order-products',
    changeConfirmedTime: 'change-confirmed-time',
    notifications: 'notifications',
    notificationsTabs: 'notifications-tabs',
    navigation: 'navigation',
    navigationMenu: 'navigation-menu',
    navigationOrderHistory: 'navigation-order-history',
    menuProduct: 'menu-product',
    orderHistoryDownload: 'order-history-download',
    pauseRestaurant: 'pause-restaurant',
    pauseRestaurantModal: 'pause-restaurant-modal'
} as const;

export type TrainingElementId = keyof typeof trainingElements;
export type TrainingControlMethods = Record<string, () => void>;
