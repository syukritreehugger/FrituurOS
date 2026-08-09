import React, { Suspense, useEffect, useRef } from 'react';
import useOrders from '@lo/shared/hooks/useOrders';
import { useCancelledOrderReferences, useOrdersStoreActions } from '@lo/shared/store/orders';
import { useIsTrainingActive, useTrainingActions, useTrainingOrder } from '@lo/shared/store/trainings';
import { isProduction } from '@lo/shared/helpers/isProduction';
import OrderList from './OrderList/OrderList';
import OrderAcceptance from './OrderAcceptance/OrderAcceptance';
import classes from './Orders.module.scss';
import OrderCancelledModal from './OrderCancelledModal/OrderCancelledModal';
import safeLazy from '@lo/shared/helpers/safeLazy';
import OrderDetailsView from './OrderDetailsView/OrderDetailsView';

const TestFrame = safeLazy(() => import('@lo/web/components/TestFrame/TestFrame'));

const Orders: React.FC = () => {
    const orderActions = useOrdersStoreActions();
    const cancelledOrderReferences = useCancelledOrderReferences();

    const { data } = useOrders();

    const ordersList = data?.array ?? [];
    const firstNewOrder = ordersList.find((order) => order.is_new);
    const newOrdersExist = !!firstNewOrder;

    const isTrainingActive = useIsTrainingActive();
    const trainingOrder = useTrainingOrder();
    const newTrainingOrder = trainingOrder?.is_new ? trainingOrder : null;
    const showTrainingAcceptance = isTrainingActive && newTrainingOrder && !newOrdersExist;

    const { pauseTraining, resumeTraining } = useTrainingActions();
    const trainingPausedByModal = useRef(false);
    const isTrainingActiveRef = useRef(isTrainingActive);
    isTrainingActiveRef.current = isTrainingActive;

    useEffect(() => {
        if (cancelledOrderReferences.length > 0 && isTrainingActiveRef.current) {
            trainingPausedByModal.current = true;
            pauseTraining();
        } else if (cancelledOrderReferences.length === 0 && trainingPausedByModal.current) {
            trainingPausedByModal.current = false;
            resumeTraining();
        }
    }, [cancelledOrderReferences.length]);

    useEffect(() => {
        return () => orderActions.closeOrderDetails();
    }, []);

    /**
     * If orderPublicReference from request URL presented in storage
     * Need to find order in loaded list and display as first priority
     */
    useEffect(() => {
        const openedOrderPublicReference = localStorage.getItem('orderFromRequest');
        if (!openedOrderPublicReference) {
            return;
        }
        const orderToShow = ordersList.find((o) => openedOrderPublicReference === o.public_reference);

        if (orderToShow) {
            orderActions.openOrderDetails(orderToShow.id);
        }

        localStorage.removeItem('orderFromRequest');
    }, [ordersList]);

    return (
        <div className={classes.container}>
            {!isProduction() && (
                <Suspense fallback={null}>
                    <TestFrame />
                </Suspense>
            )}

            <div className={classes.innerContainer}>
                <OrderList />

                <OrderDetailsView />

                {newOrdersExist && <OrderAcceptance order={firstNewOrder} />}
                {showTrainingAcceptance && <OrderAcceptance order={newTrainingOrder} />}

                {cancelledOrderReferences.length > 0 && <OrderCancelledModal reference={cancelledOrderReferences[0]} />}
            </div>
        </div>
    );
};

export default Orders;
