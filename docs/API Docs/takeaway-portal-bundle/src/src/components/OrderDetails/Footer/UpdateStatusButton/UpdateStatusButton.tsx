import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@jet-pie/react';
import useUpdateOrderStatus from '@lo/shared/hooks/useUpdateOrderStatus';
import { orderStatus } from '@lo/shared/enums/orderStatusesEnum';
import { Check, PickUp, PrepareBag } from '@jet-pie/react/esm/icons';
import OrderModel from '@lo/shared/models/OrderModel';
import { trainingElements } from '@lo/shared/types/trainings';
import useOrders from '@lo/shared/hooks/useOrders';
import { useIsReconnectingSockets } from '@lo/shared/store/appStatus';

type UpdateStatusButtonProps = {
    order: OrderModel;
    fullWidth: boolean;
    isWaitingForCourier?: boolean;
};

type RenderButtonProps = {
    dataTestId: string;
    moveToStatus: orderStatus;
    text: string;
    icon: React.ReactElement;
    disabled?: boolean;
};

const UpdateStatusButton: React.FC<UpdateStatusButtonProps> = ({ order, fullWidth, isWaitingForCourier }) => {
    const { t } = useTranslation();
    const { isFetching } = useOrders();
    const isReconnectingSockets = useIsReconnectingSockets();
    const { mutate, isPending } = useUpdateOrderStatus();

    const renderButton = (props: RenderButtonProps) => {
        const updateStatus = () => {
            mutate({ id: order.id, status: props.moveToStatus });
        };

        return (
            <Button
                isLoading={isPending}
                disabled={props.disabled || isFetching || isReconnectingSockets}
                data-testid={props.dataTestId}
                onClick={() => updateStatus()}
                icon={props.icon}
                iconPosition="leading"
                size="medium"
                fullWidth={fullWidth}
                data-training-id={trainingElements.updateStatusButton}
            >
                {props.text}
            </Button>
        );
    };

    if (order.is_confirmed) {
        return renderButton({
            dataTestId: 'update-order-status-to-kitchen-button',
            moveToStatus: orderStatus.KITCHEN,
            text: t('orders.live_orders_order_list.tabs.prepare'),
            icon: <PrepareBag width={20} height={20} />,
            disabled: isWaitingForCourier
        });
    }

    if (order.is_in_kitchen && !order.is_pickup) {
        return renderButton({
            dataTestId: 'update-order-status-to-in-delivery-button',
            moveToStatus: orderStatus.IN_DELIVERY,
            text: t('orders.live_orders_order_list.tabs.handover'),
            icon: <PickUp width={20} height={20} />
        });
    }

    if (order.is_in_delivery || (order.is_in_kitchen && order.is_pickup)) {
        return renderButton({
            dataTestId: 'update-order-status-to-delivered-button',
            moveToStatus: orderStatus.DELIVERED,
            text: t('orders.live_orders_order_list.tabs.done'),
            icon: <Check width={20} height={20} />
        });
    }

    return null;
};

export default UpdateStatusButton;
