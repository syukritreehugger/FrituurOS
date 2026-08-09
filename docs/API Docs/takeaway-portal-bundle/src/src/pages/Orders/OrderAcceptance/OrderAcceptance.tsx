import React, { useEffect } from 'react';
import { SideSheet } from '@jet-pie/react';
import { OrderModel } from '@lo/shared/models';
import { useOrdersStoreActions } from '@lo/shared/store/orders';
import OrderDetails from '@lo/web/components/OrderDetails/OrderDetails';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import useExtraActions from '@lo/web/components/OrderDetails/hooks/useExtraActions';
import { useOverflowElement } from '@lo/web/hooks/useOverflowElement';

type OrderAcceptanceProps = {
    order: OrderModel;
};

const OrderAcceptance: React.FC<OrderAcceptanceProps> = ({ order }) => {
    const { closeOrderDetails } = useOrdersStoreActions();
    const extraActions = useExtraActions(order);
    const { isLessThanTabletWidth } = useWindowSize();
    const [, setIsOpen] = useOverflowElement();

    useEffect(() => {
        setIsOpen(true);

        return () => setIsOpen(false);
    }, []);

    return (
        <SideSheet
            key={order.id}
            id="orderDetailsSideSheet"
            isOpen={true}
            onShowSideSheet={closeOrderDetails}
            orientation="right"
            width={isLessThanTabletWidth ? '100%' : '600px'}
            hideHeader
            backdrop
        >
            <OrderDetails order={order} closeOrderDetails={closeOrderDetails} extraActions={extraActions} isNewOrder />
        </SideSheet>
    );
};

export default OrderAcceptance;
