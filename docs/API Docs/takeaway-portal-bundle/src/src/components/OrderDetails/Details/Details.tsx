import React, { useEffect, useRef, useState } from 'react';
import { OrderModel, RestaurantModel } from '@lo/shared/models';
import Products from './Products/Products';
import classes from './Details.module.scss';
import Total from './Total/Total';
import Customer from './Customer/Customer';
import Remarks from './Remarks/Remarks';
import UnavailableItemsMessage from '../UnavailableItemsMessageWrapper/UnavailableItemsMessageWrapper';
import Header from '../Header/Header';
import useExtraActions from '../hooks/useExtraActions';
import Footer from '../Footer/Footer';
import classNames from 'classnames';
import { formatTime } from '@lo/shared/helpers/formatTime';
import { useTranslation } from 'react-i18next';

type DetailsProps = {
    order: OrderModel;
    restaurant: RestaurantModel;
    hasChainRestaurants: boolean;
    isOrderHistory: boolean;
    extraActions: ReturnType<typeof useExtraActions>;
    isNewOrder: boolean;
};

const Details: React.FC<DetailsProps> = (props) => {
    const { order, restaurant, hasChainRestaurants, isOrderHistory, extraActions, isNewOrder } = props;
    const { t } = useTranslation();

    const containerRef = useRef<HTMLDivElement>(null);

    const [scrolledToTop, setScrolledToTop] = useState(true);
    const [scrolledToBottom, setScrolledToBottom] = useState(true);

    const showCategories = restaurant.ui_settings.show_product_categories;
    const productIdLength = restaurant.receipt_settings.product_id_length;
    const showCode = restaurant.ui_settings.show_product_id;
    const showFooter =
        !isOrderHistory &&
        !order.is_cancelled &&
        !(hasChainRestaurants && order.is_delivered) &&
        (order.is_new || !order.is_next_day_scheduled);

    useEffect(() => {
        if (!containerRef.current) return;

        const verticalScrollExists = containerRef.current?.scrollHeight > containerRef.current?.clientHeight;
        setScrolledToBottom(!verticalScrollExists);
    }, [order, setScrolledToBottom]);

    const handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

        setScrolledToTop(scrollTop === 0);
        setScrolledToBottom(scrollHeight - scrollTop - clientHeight < 10);
    };

    return (
        <div
            ref={containerRef}
            className={classes.container}
            onScroll={handleScroll}
            data-testid="order-details-scrollable-container"
        >
            <Header
                order={order}
                restaurant={restaurant}
                extraActions={extraActions}
                showShadow={!scrolledToTop}
                isOrderHistory={isOrderHistory}
                hideSensitiveInformation={false}
            />

            <div className={classNames(classes.content, { [classes.narrow]: isOrderHistory })}>
                <Customer order={order} restaurant={restaurant} hideSensitiveInformation={hasChainRestaurants} />
                {order.confirmed_at &&
                    `${t('orders.live_orders_order_details.confirmation.accepted_at')} ${formatTime(
                        order.confirmed_at,
                        'HH:mm - d MMM'
                    )}`}
                <Remarks
                    customer={order.customer}
                    remarks={order.remarks}
                    restaurant={restaurant}
                    hasChainRestaurants={hasChainRestaurants}
                />
                <UnavailableItemsMessage order={order} restaurant={restaurant} />

                <div className={classNames([classes.details, isNewOrder && classes.newOrder])}>
                    <Products
                        order={order}
                        showCategories={showCategories}
                        productIdLength={productIdLength}
                        showCode={showCode}
                    />
                    <Total order={order} restaurant={restaurant} />
                </div>
            </div>

            {showFooter && (
                <Footer
                    order={order}
                    isUpdatingConfirmedTimes={extraActions.isUpdatingConfirmedTimes}
                    toggleUpdateConfirmedTimes={extraActions.toggleUpdateConfirmedTimes}
                    hidePrintButton={hasChainRestaurants}
                    showShadow={!scrolledToBottom}
                />
            )}
        </div>
    );
};

export default Details;
