import React, { FC, ReactNode, useEffect } from 'react';
import { BottomSheet, SideSheet, Spinner } from '@jet-pie/react';
import useOrderDetails from '@lo/shared/hooks/useOrderDetails';
import OrderDetails from '@lo/web/components/OrderDetails/OrderDetails';
import useExtraActions from '@lo/web/components/OrderDetails/hooks/useExtraActions';
import classes from './DetailsModal.module.scss';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import analytics from '@lo/shared/services/analytics';
import { useOverflowElement } from '@lo/web/hooks/useOverflowElement';

type DetailsModalProps = {
    orderId: number | null;
    onClose: () => void;
};

const DetailsModal: FC<DetailsModalProps> = ({ orderId, onClose }) => {
    const { data, isFetching } = useOrderDetails(orderId);
    const extraActions = useExtraActions(data, true);
    const { isLessThanTabletWidth } = useWindowSize();
    const [isOpen, setIsOpen] = useOverflowElement();

    useEffect(() => {
        setIsOpen(orderId !== null);
    }, [orderId]);

    const title = data ? `#${data.public_reference}` : '';

    useEffect(() => {
        data && analytics.orderHistory.openedOrder(data);
    }, [data]);

    const closeModal = () => {
        data && analytics.orderHistory.closedOrder(data);
        onClose();
    };

    const dialogWrapper = (children: ReactNode) => {
        if (isLessThanTabletWidth) {
            return (
                <BottomSheet
                    height="100%"
                    headerTitle={title}
                    headerContentModifiers="default"
                    isOpened={isOpen}
                    onClose={closeModal}
                >
                    {children}
                </BottomSheet>
            );
        } else {
            return (
                <SideSheet title={title} isOpen={isOpen} onShowSideSheet={onClose} width="30%" orientation="right" backdrop>
                    {children}
                </SideSheet>
            );
        }
    };

    return dialogWrapper(
        <>
            {isFetching && (
                <div className={classes.spinnerContainer} data-testid="spinner">
                    <Spinner size="S" variant="brand" />
                </div>
            )}
            {data && (
                <div className={classes.scrollableContainer}>
                    <OrderDetails order={data} extraActions={extraActions} closeOrderDetails={onClose} isOrderHistory />
                </div>
            )}
        </>
    );
};

export default DetailsModal;
