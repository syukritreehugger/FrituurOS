import React, { FC } from 'react';
import { IconButton } from '@jet-pie/react';
import { Check, PickUp, PrepareBag } from '@jet-pie/react/esm/icons';
import { OrderModel } from '@lo/shared/models';
import { orderStatus } from '@lo/shared/enums/orderStatusesEnum';
import useUpdateOrderStatus from '@lo/shared/hooks/useUpdateOrderStatus';
import classes from './ActionButton.module.scss';
import useRestaurant from '@lo/shared/hooks/useRestaurant';

type ActionButtonProps = {
    order: OrderModel;
};

const ActionButton: FC<ActionButtonProps> = ({ order }) => {
    const { mutate, isPending } = useUpdateOrderStatus();
    const restaurant = useRestaurant();
    const isWaitingForCourier = order.is_waiting_for_courier(restaurant);

    const getIcon = () => {
        if (order.is_confirmed) {
            return <PrepareBag />;
        }

        if (order.is_in_delivery || (order.is_in_kitchen && order.is_pickup)) {
            return <Check />;
        }

        if (order.is_in_kitchen) {
            return <PickUp />;
        }

        return null;
    };

    const handleUpdateOrderStatus = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();

        if (order.is_confirmed) {
            mutate({ id: order.id, status: orderStatus.KITCHEN });
        } else if (order.is_in_kitchen && !order.is_pickup) {
            mutate({ id: order.id, status: orderStatus.IN_DELIVERY });
        } else if (order.is_in_delivery || (order.is_in_kitchen && order.is_pickup)) {
            mutate({ id: order.id, status: orderStatus.DELIVERED });
        }
    };

    return (
        <div className={classes.container}>
            <IconButton
                variant="ghost"
                size="medium"
                icon={getIcon()}
                onClick={handleUpdateOrderStatus}
                disabled={isWaitingForCourier || isPending}
                data-testid={`order-update-status-${order.public_reference}`}
            />
        </div>
    );
};

export default ActionButton;
