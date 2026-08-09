import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import classNames from 'classnames';
import useCanPrintOrder from '@lo/shared/hooks/useCanPrintOrder';
import UpdateStatusButton from './UpdateStatusButton/UpdateStatusButton';
import PrintButton from './PrintButton/PrintButton';
import { useToasterStoreActions } from '@lo/shared/store/toaster';
import { useAutoPrintedOrderIds, useOrdersStoreActions } from '@lo/shared/store/orders';
import OrderDetailsConfirmation from '../../OrderDetailsConfirmation/OrderDetailsConfirmation';
import OrderModel from '@lo/shared/models/OrderModel';
import classes from './Footer.module.scss';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import useRestaurant from '@lo/shared/hooks/useRestaurant';

export type FooterProps = {
    order: OrderModel;
    hidePrintButton: boolean;
    setOrderIsAutoPrinted?: (id: number) => void;
    isUpdatingConfirmedTimes: boolean;
    toggleUpdateConfirmedTimes: () => void;
    showShadow: boolean;
};

const Footer: React.FC<FooterProps> = (props) => {
    const { order, hidePrintButton, isUpdatingConfirmedTimes, toggleUpdateConfirmedTimes, showShadow } = props;

    const restaurant = useRestaurant();
    const { t } = useTranslation();
    const { width } = useWindowSize();
    const navigate = useNavigate();
    const { canPrint, canAutoPrint } = useCanPrintOrder(order);
    const { setToasterBottomOffset, resetToasterBottomOffset } = useToasterStoreActions();
    const containerRef = useRef<HTMLDivElement>(null);
    const actions = useOrdersStoreActions();
    const autoPrintedOrderIds = useAutoPrintedOrderIds();

    const isWaitingForCourier = order.is_waiting_for_courier(restaurant);
    const isOrderAutoPrinted = autoPrintedOrderIds?.findIndex((orderId: number) => orderId === order.id) !== -1;

    const maxWidthForMobileView = Number(classes.maxWidthForMobileView.replace(/\D/g, ''));

    const printReceipt = () => navigate(`/orders/${order.id}/receipt`);

    useEffect(() => {
        if (canAutoPrint && !isOrderAutoPrinted) {
            printReceipt();
            actions.autoPrintedOrder(order.id);
        }
    }, [canAutoPrint, printReceipt, isOrderAutoPrinted, order.is_ready_for_kitchen]);

    useEffect(() => {
        setToasterBottomOffset(containerRef.current?.clientHeight ?? 0);
        return resetToasterBottomOffset;
    }, [order.status]);

    if (order.public_reference.startsWith('FAKE')) {
        return (
            <div className={classes.container}>
                This is a fake order.
                <br />
                No actions available.
            </div>
        );
    }

    return (
        <div
            className={classNames(classes.container, { [classes.withShadow]: showShadow })}
            data-testid="order-details-update-status"
            ref={containerRef}
        >
            {isWaitingForCourier && (
                <div className={classes.infoMessageContainer}>
                    <p className={classes.infoMessage}>
                        {t('orders.live_orders_order_details.titles.waiting_for_courier_description')}
                    </p>
                </div>
            )}

            {order.is_new || isUpdatingConfirmedTimes ? (
                <OrderDetailsConfirmation
                    order={order}
                    printReceipt={printReceipt}
                    hidePrintButton={hidePrintButton}
                    isUpdatingConfirmedTimes={isUpdatingConfirmedTimes}
                    toggleUpdateConfirmedTimes={toggleUpdateConfirmedTimes}
                />
            ) : (
                <div className={classes.updateStatusContainer} data-testid="order-details-update-container">
                    {!hidePrintButton && (
                        <PrintButton onClick={printReceipt} disabled={!canPrint} fullWidth={width < maxWidthForMobileView} />
                    )}

                    <UpdateStatusButton
                        order={order}
                        fullWidth={width < maxWidthForMobileView}
                        isWaitingForCourier={isWaitingForCourier}
                    />
                </div>
            )}
        </div>
    );
};

export default Footer;
