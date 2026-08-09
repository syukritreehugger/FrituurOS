import { OrderData } from '../../types/orderDataType';
import { ReceiptSettings } from '../../types/receiptSettingsType';
import { Courier } from '../../types/courierType';
import { Notification } from '../../types/notificationType';
import queryClient from '../query/queryClient';
import transformEntityTimeToDateObjects from '../../helpers/transformEntityTimeToDateObjects';
import { Menu, OutOfStockProductNotification, OutOfStockProductsNotification } from '../../types/menuType';
import truncateString from '../../helpers/string/truncateString';
import newNotificationListener from './listeners/newNotificationListener';
import orderUpdateListener from './listeners/orderUpdateListener';
import { RestaurantModel } from '../../models';
import { RestaurantData } from '../../types/restaurantDataType';
import orderCreatedListener from './listeners/orderCreatedListener';

type SocketListener = [string, string, (payload: any) => void];

export default (restaurant: RestaurantModel): SocketListener[] => {
    const ordersChannel = `private-restaurant.${restaurant.reference}.orders`;
    const receiptSettingsChannel = `private-restaurant.${restaurant.reference}.receipt-settings`;
    const restaurantChannel = `private-restaurant.${restaurant.reference}`;
    const restaurantMenuChannel = `private-restaurant.${restaurant.reference}.menu`;
    const notificationsChannel = `private-restaurant.${restaurant.reference}.notifications`;

    return [
        [
            ordersChannel,
            'OrderCreatedEvent',
            (newOrderData: OrderData) => orderCreatedListener(transformEntityTimeToDateObjects(newOrderData))
        ],
        [
            ordersChannel,
            'OrderUpdatedEvent',
            (orderData: OrderData) => orderUpdateListener(transformEntityTimeToDateObjects(orderData))
        ],
        [
            receiptSettingsChannel,
            'ReceiptSettingsUpdated',
            (receiptSettings: ReceiptSettings) => {
                const newRestaurantData = { ...restaurant, receipt_settings: receiptSettings };
                queryClient.setQueryData(['restaurant'], newRestaurantData);
            }
        ],
        [
            restaurantChannel,
            'RestaurantUpdatedEvent',
            (restaurantData: RestaurantData) => queryClient.setQueryData<RestaurantData>(['restaurant'], restaurantData)
        ],
        [
            notificationsChannel,
            'DeliveredLastOrder',
            (notification: Notification<Courier>) => newNotificationListener(transformEntityTimeToDateObjects(notification))
        ],
        [
            notificationsChannel,
            'ProductStockUpdate',
            (notification: Notification<OutOfStockProductNotification>) => {
                notification.context.product.name = truncateString(notification.context.product.name);
                newNotificationListener(transformEntityTimeToDateObjects(notification));

                queryClient.setQueryData<Menu>(['menu', restaurant.id], (menu) => {
                    if (menu === undefined) return;

                    const product = notification.context.product;

                    menu.categories = menu.categories.map((category) => {
                        category.products = category.products?.map((productInCategory) => {
                            if (productInCategory.id === product.id) {
                                productInCategory.sold_out = product.isSoldOut;
                            }

                            return { ...productInCategory };
                        });

                        return { ...category };
                    });

                    return { ...menu };
                });
            }
        ],
        [
            notificationsChannel,
            'ProductsStockUpdate',
            (notification: Notification<OutOfStockProductsNotification>) => {
                newNotificationListener(transformEntityTimeToDateObjects(notification));
                queryClient.setQueryData<Menu | undefined>(['menu', restaurant.id], (menu) => {
                    if (menu === undefined) return;

                    const products = notification.context.products;

                    const newCategories = menu.categories.map((category) => {
                        const newProducts = category.products?.map((productInCategory) => {
                            const updatedProduct = products.find(
                                (item) => item.id === productInCategory.id && item.name === productInCategory.name
                            );

                            const newProduct = { ...productInCategory };
                            if (updatedProduct) {
                                newProduct.sold_out = updatedProduct.is_sold_out;
                                newProduct.back_to_stock_at = updatedProduct.is_sold_out ? updatedProduct.back_to_stock_at : null;
                            }

                            return newProduct;
                        });

                        return { ...category, products: transformEntityTimeToDateObjects(newProducts) };
                    });

                    return { ...menu, categories: newCategories };
                });
            }
        ],
        [
            restaurantMenuChannel,
            'RestaurantMenuUpdatedSocketEvent',
            (newMenu: Menu) => {
                queryClient.setQueryData<Menu>(['menu', restaurant.id], (menu) => {
                    if (newMenu.categories) {
                        return {
                            ...newMenu,
                            categories: newMenu.categories.map((category) => ({
                                ...category,
                                products: transformEntityTimeToDateObjects(category.products)
                            }))
                        };
                    }

                    return menu ? { ...menu, updated_at: newMenu.updated_at } : menu;
                });
            }
        ]
    ];
};
