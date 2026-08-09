import React, { useEffect } from 'react';
import { SideSheet } from '@jet-pie/react';
import useOrderDetails from '@lo/shared/hooks/useOrderDetails';
import { useOpenedOrderId, useOrdersStoreActions } from '@lo/shared/store/orders';
import { useIsTrainingActive, useTrainingOrderDetails } from '@lo/shared/store/trainings';
import OrderDetails from '@lo/web/components/OrderDetails/OrderDetails';
import useExtraActions from '@lo/web/components/OrderDetails/hooks/useExtraActions';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import classes from './OrderDetailsView.module.scss';

const OrderDetailsView: React.FC = () => {
    const orderActions = useOrdersStoreActions();
    const openedOrderId = useOpenedOrderId();

    const { data: openedOrder } = useOrderDetails(openedOrderId);
    const trainingOrderDetails = useTrainingOrderDetails();
    const isTrainingActive = useIsTrainingActive();

    const { isLessThanTabletWidth } = useWindowSize();
    const extraActions = useExtraActions(openedOrder);
    const hideDetailsSheetOnOutsideClick =
        !extraActions.isUnavailableItemsPopupOpened && !extraActions.isOrderListSettingsPopupOpened;

    useEffect(() => {
        return () => orderActions.closeOrderDetails();
    }, []);

    const order = isTrainingActive ? (trainingOrderDetails ? trainingOrderDetails : null) : openedOrder;
    const isSideSheetOpened = isTrainingActive ? !!trainingOrderDetails : openedOrderId !== null;

    const orderDetails = order && (
        <OrderDetails
            key={order.id}
            order={order}
            extraActions={extraActions}
            closeOrderDetails={orderActions.closeOrderDetails}
        />
    );

    return isLessThanTabletWidth ? (
        <SideSheet
            id="orderDetailsSideSheet"
            isOpen={isSideSheetOpened}
            onShowSideSheet={orderActions.closeOrderDetails}
            orientation="right"
            width={isLessThanTabletWidth ? '100%' : '600px'}
            hideHeader
            backdrop
            hideOnOutsideClick={hideDetailsSheetOnOutsideClick}
        >
            {orderDetails}
        </SideSheet>
    ) : (
        <div className={classes.detailsContainer}>{orderDetails && <div className={classes.details}>{orderDetails}</div>}</div>
    );
};

export default OrderDetailsView;
