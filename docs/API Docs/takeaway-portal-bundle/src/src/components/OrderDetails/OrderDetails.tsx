import React from 'react';
import classNames from 'classnames';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import Details from './Details/Details';
import classes from './OrderDetails.module.scss';
import Navigation from './Navigation/Navigation';
import UnavailableItemsPopup from './UnavailableItemsPopup/UnavailableItemsPopup';
import OrderListSettingsPopup from './OrderListSettingsPopup/OrderListSettingsPopup';
import useExtraActions from './hooks/useExtraActions';
import OrderModel from '@lo/shared/models/OrderModel';
import { useIsChainAccount } from '@lo/shared/store/auth';
import Message from './Message/Message';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';

type OrderDetailsProps = {
    order: OrderModel;
    isOrderHistory?: boolean;
    setOrderIsAutoPrinted?: (id: number) => void;
    closeOrderDetails: (id: number | undefined) => void;
    extraActions: ReturnType<typeof useExtraActions>;
    isNewOrder?: boolean;
};

const OrderDetails: React.FC<OrderDetailsProps> = (props) => {
    const { order, isOrderHistory = false, closeOrderDetails, extraActions, isNewOrder = false } = props;

    const restaurant = useRestaurant();
    const isChainAccount = useIsChainAccount();
    const { isLessThanTabletWidth } = useWindowSize();

    const handleClose = () => order && closeOrderDetails(order.id);

    const showNavigation = !isOrderHistory && (isLessThanTabletWidth || order.is_new);

    return (
        <>
            <div
                className={classNames(classes.container, { [classes.orderHistory]: isOrderHistory })}
                data-testid="order-details"
            >
                {showNavigation && <Navigation order={order} onClose={handleClose} extraActions={extraActions} />}

                <Message order={order} />

                <Details
                    order={order}
                    restaurant={restaurant}
                    hasChainRestaurants={isChainAccount}
                    isOrderHistory={isOrderHistory}
                    extraActions={extraActions}
                    isNewOrder={isNewOrder}
                />
            </div>

            {extraActions.isUnavailableItemsPopupOpened && (
                <UnavailableItemsPopup
                    order={order}
                    contact={restaurant.country_contact_information.phone}
                    onClose={() => extraActions.toggleUnavailableItemsPopup()}
                />
            )}

            <OrderListSettingsPopup
                isOpen={extraActions.isOrderListSettingsPopupOpened}
                onClose={() => extraActions.toggleOrderListSettingsPopup()}
            />

            <div className={classNames(classes.overlay, { [classes.hidden]: !extraActions.opened })} />
        </>
    );
};

export default OrderDetails;
