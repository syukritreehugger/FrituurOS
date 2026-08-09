import { addMinutes } from 'date-fns';
import { DELIVERY } from '../constants';
import { orderStatus } from '../enums/orderStatusesEnum';
import { makeOrder } from '../factories/order';
import { OrderModel } from '../models';
import { queryClient } from '../services/query';
import { useTrainingStore } from '../store/trainings';
import { Training, TrainingStep, TrainingElementId, trainingElements } from '../types/trainings';
import { OrderData } from '../types/orderDataType';
import { makeProduct } from '../factories/product';

const elements = trainingElements;

export const getTrainingElement = (id: string): HTMLElement | null => document.querySelector(`[data-training-id="${id}"]`);

const ui = (id: TrainingElementId, name: string) => () => {
    useTrainingStore.getState().actions.callUIMethod(id, name);
};

const openNavigation = ui('navigation', 'open');
const closeNavigation = ui('navigation', 'closePauseRestaurant');
const openNotifications = ui('notifications', 'open');

const testOrderData: Partial<OrderModel> = {
    id: 0,
    status: orderStatus.CONFIRMED,
    delivery_type: DELIVERY,
    public_reference: 'DEMO',
    customer: {
        city: 'Amsterdam',
        company_name: null,
        full_name: 'Oliver S.',
        phone_number: '0208 736 2000',
        display_phone_number: '0208 736 2000',
        postcode: '2054DJ',
        street: 'Eerste Helmersstraat',
        street_number: '56'
    },
    remarks: undefined,
    with_alcohol: false,
    placed_date: new Date(),
    requested_time: addMinutes(new Date(), 20),
    restaurant_estimated_delivery_time: addMinutes(new Date(), 20),
    restaurant_estimated_pickup_time: addMinutes(new Date(), 20),
    products: [makeProduct({ name: 'Maestro Burger', remarks: null, code: 'DEMO' })]
};

const createTrainingOrder = (data: Partial<OrderData>) => {
    const order = makeOrder({ ...testOrderData, ...data });
    useTrainingStore.getState().actions.setTestOrder(order);
};

const createNewTrainingOrder = () => {
    const order = makeOrder({ ...testOrderData, status: orderStatus.NEW });
    useTrainingStore.getState().actions.setTestOrder(order);
};

const createAcceptedTrainingOrder = () => {
    const order = makeOrder(testOrderData);
    useTrainingStore.getState().actions.setTestOrder(order);
};

const createTrainingOrderDetails = (data?: Partial<OrderData>) => {
    const order = makeOrder({ ...testOrderData, ...data });
    useTrainingStore.getState().actions.setTestOrderDetails(order);
};

const clearTrainingStore = () => {
    useTrainingStore.getState().actions.setTestOrder(null);
    useTrainingStore.getState().actions.setTestOrderDetails(null);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    ui('prepareTab', 'select')();
};

const clearTrainingNotificationsStore = () => {
    ui('notifications', 'close')();
};

const clearAndCreateAcceptedOrder = () => {
    clearTrainingStore();
    createAcceptedTrainingOrder();
};

const clearAndCreateNewOrder = () => {
    clearTrainingStore();
    createNewTrainingOrder();
};

const setKitchenOrderAndDetails = () => {
    createTrainingOrder({ ...testOrderData, status: orderStatus.KITCHEN });
    createTrainingOrderDetails({ ...testOrderData, status: orderStatus.KITCHEN });
};

const clearAndSetKitchenOrder = () => {
    clearTrainingStore();
    setKitchenOrderAndDetails();
};

const clearAndSetDelivered = () => {
    clearTrainingStore();
    createTrainingOrder({ status: orderStatus.DELIVERED });
    ui('doneTab', 'select')();
};

const clearAndSetInDelivery = () => {
    clearTrainingStore();
    createTrainingOrder({ status: orderStatus.IN_DELIVERY });
    ui('handoverTab', 'select')();
};

const clearAndSetKitchenStart = () => {
    clearTrainingStore();
    setKitchenOrderAndDetails();
};

const setInDeliveryOrderDetails = () => createTrainingOrderDetails({ status: orderStatus.IN_DELIVERY });

const step = (id: string, opts?: Partial<TrainingStep>): TrainingStep => ({ id, ...opts });

const training = (id: string, steps: TrainingStep[], timeToComplete = 2, route?: string): Training => ({
    id,
    timeToComplete,
    route,
    steps
});

export const trainingChecklist: Training[] = [
    training(
        'home',
        [
            step('start', { title: 'start_title', onStart: clearTrainingStore }),
            step('screen'),
            step('prepare_tab', { elementId: elements.prepareTab, onStart: ui('prepareTab', 'select') }),
            step('handover_tab', { elementId: elements.handoverTab, onStart: ui('handoverTab', 'select') }),
            step('done_tab', {
                elementId: elements.doneTab,
                onStart: ui('doneTab', 'select'),
                onComplete: ui('prepareTab', 'select')
            }),
            step('final', { title: 'final_title' })
        ],
        2,
        '/orders'
    ),
    training(
        'orders',
        [
            step('new_order', {
                onStart: createNewTrainingOrder,
                onBack: clearTrainingStore
            }),
            step('delivery_time', { elementId: elements.deliveryTime }),
            step('time', { elementId: elements.timeControls }),
            step('accept', {
                elementId: elements.acceptOrder,
                onComplete: clearAndCreateAcceptedOrder
            }),
            step('item', {
                elementId: elements.orderItem,
                onBack: clearAndCreateNewOrder,
                onComplete: createTrainingOrderDetails
            }),
            step('item_details', {
                elementId: elements.orderItem,
                onBack: clearAndCreateAcceptedOrder
            }),
            step('contact', {
                elementId: elements.orderContact,
                onStart: ui('orderContact', 'show')
            }),
            step('products', {
                elementId: elements.orderProducts,
                onComplete: clearTrainingStore
            })
        ],
        2,
        '/orders'
    ),
    training(
        'preparing',
        [
            step('extra_action', {
                elementId: elements.orderDetailsActions,
                onStart: clearAndSetKitchenStart
            }),
            step('delivery_time', {
                elementId: elements.changeConfirmedTime,
                onElementFound: ui('changeConfirmedTime', 'open'),
                onBack: ui('changeConfirmedTime', 'close'),
                onComplete: ui('changeConfirmedTime', 'close')
            }),
            step('handover', {
                elementId: elements.updateStatusButton,
                onComplete: clearTrainingStore
            })
        ],
        2,
        '/orders'
    ),
    training(
        'handover',
        [
            step('handover_tab', {
                elementId: elements.handoverTab,
                onStart: clearAndSetInDelivery,
                onBack: clearAndSetKitchenOrder
            }),
            step('done_button', {
                elementId: elements.updateStatusButton,
                onStart: setInDeliveryOrderDetails,
                onComplete: clearTrainingStore
            })
        ],
        2,
        '/orders'
    ),
    training(
        'done',
        [
            step('done_tab', {
                elementId: elements.doneTab,
                onStart: clearAndSetDelivered,
                onBack: clearAndSetInDelivery
            }),
            step('next_title', { onComplete: clearTrainingStore })
        ],
        2,
        '/orders'
    ),
    training('notifications', [
        step('bell_icon', {
            elementId: elements.notifications,
            onBack: clearTrainingNotificationsStore,
            onStart: clearTrainingNotificationsStore,
            onComplete: openNotifications
        }),
        step('tabs', {
            elementId: elements.notificationsTabs,
            onComplete: clearTrainingNotificationsStore
        })
    ]),
    training(
        'advanced',
        [
            step('intro', {
                onBack: openNotifications,
                onComplete: openNavigation
            }),
            step('navigation', {
                elementId: elements.navigation
            }),
            step('menu', {
                elementId: elements.navigationMenu,
                onStart: openNavigation
            }),
            step('menu_product', {
                elementId: elements.menuProduct,
                onStart: ui('navigation', 'openMenuPage')
            }),
            step('order_history', {
                elementId: elements.navigationOrderHistory,
                onStart: openNavigation
            }),
            step('order_history_download', {
                elementId: elements.orderHistoryDownload,
                onStart: ui('navigation', 'openOrderHistoryPage')
            }),
            step('pause', {
                elementId: elements.pauseRestaurant,
                onStart: openNavigation
            }),
            step('pause_modal', {
                elementId: elements.pauseRestaurantModal,
                onBack: closeNavigation,
                onStart: ui('navigation', 'openPauseRestaurant'),
                onComplete: closeNavigation
            }),
            step('finish', { title: 'finish_title' })
        ],
        2,
        '/orders'
    )
];
