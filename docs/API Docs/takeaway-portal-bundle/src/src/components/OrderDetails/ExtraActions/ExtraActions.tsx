import React, { ReactElement } from 'react';
import { IconButton, useOnClickOutside } from '@jet-pie/react';
import { ClockAdd, Settings, FoodReady, List, MoreVertical, Close } from '@jet-pie/react/esm/icons';
import { t } from 'i18next';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { orderStatus } from '@lo/shared/enums/orderStatusesEnum';
import useUpdateOrderStatus from '@lo/shared/hooks/useUpdateOrderStatus';
import { useIsChainAccount } from '@lo/shared/store/auth';
import OrderModel from '@lo/shared/models/OrderModel';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import classes from './ExtraActions.module.scss';
import { trainingElements } from '@lo/shared/types/trainings';
import useTrainingControl from '@lo/shared/hooks/useTrainingControl';

type ExtraActionsProps = {
    order: OrderModel;
    opened: boolean;
    toggleOpened: () => void;
    openOrderListSettingsPopup: () => void;
    openUnavailableItemsPopup: () => void;
    toggleUpdateConfirmedTimes: (value: boolean) => void;
};

const ExtraActions: React.FC<ExtraActionsProps> = (props) => {
    const { order, opened, toggleOpened, openOrderListSettingsPopup, openUnavailableItemsPopup, toggleUpdateConfirmedTimes } =
        props;

    const restaurant = useRestaurant();
    const isRegularAccount = !useIsChainAccount();
    const updateOrderStatus = useUpdateOrderStatus();
    const isWaitingForCourier = order.is_waiting_for_courier(restaurant);
    const { containerRef } = useOnClickOutside(() => opened && toggleOpened());
    const { isLessThanTabletWidth } = useWindowSize();

    useTrainingControl('changeConfirmedTime', {
        open: () => toggleUpdateConfirmedTimes(true),
        close: () => toggleUpdateConfirmedTimes(false)
    });

    const extraActions: ReactElement[] = [];

    if (!order.is_cancelled && !order.is_delivered && !order.is_new) {
        extraActions.push(
            <button
                key={0}
                type="button"
                data-testid="order-list-settings-button"
                onClick={() => {
                    toggleOpened();
                    openOrderListSettingsPopup();
                }}
            >
                <Settings className={classes.icon} width={20} height={20} />
                {t('orders.live_orders_settings.settings_page.orders_list_settings')}
            </button>
        );
    }

    if (isRegularAccount && restaurant.can_change_confirmed_time_of_order(order)) {
        extraActions.push(
            <button
                key={1}
                disabled={updateOrderStatus.isPending || isWaitingForCourier}
                type="button"
                data-testid="change-confirmed-times-button"
                onClick={() => {
                    toggleOpened();
                    toggleUpdateConfirmedTimes(true);
                }}
            >
                <ClockAdd className={classes.icon} width={20} height={20} />
                {t('orders.live_orders_order_details.confirmation.change_time')}
            </button>
        );
    }

    if (isRegularAccount && restaurant.is_grocery_unified_flow && (order.is_new || order.is_confirmed || order.is_in_kitchen)) {
        extraActions.push(
            <button
                key={2}
                type="button"
                data-testid="unavailable-items-button"
                disabled={order.has_unavailable_products}
                onClick={() => {
                    toggleOpened();
                    openUnavailableItemsPopup();
                }}
            >
                <List className={classes.icon} width={20} height={20} />
                {t('orders.live_orders_order_details.unavailable_items.button_title')}
            </button>
        );
    }

    if (isRegularAccount && restaurant.can_revert_order_status && order.is_in_delivery && !restaurant.is_just_eat) {
        extraActions.push(
            <button
                key={3}
                disabled={updateOrderStatus.isPending || isWaitingForCourier}
                type="button"
                data-testid="move-back-to-kitchen-button"
                onClick={() => {
                    toggleOpened();
                    updateOrderStatus.mutate({ id: order.id, status: orderStatus.KITCHEN });
                }}
            >
                <FoodReady className={classes.icon} width={20} height={20} />
                {t('orders.live_orders_order_details.confirmation.move_to_prepare')}
            </button>
        );
    }

    return extraActions.length > 0 ? (
        <div className={classes.container} ref={containerRef} data-training-id={trainingElements.orderDetailsActions}>
            <IconButton
                size={isLessThanTabletWidth ? 'x-small' : 'small'}
                variant={isLessThanTabletWidth ? 'ghost' : 'outline'}
                onClick={toggleOpened}
                icon={opened ? <Close /> : <MoreVertical />}
                data-testid="toggle-extra-actions-button"
            />
            {opened && <div className={classes.popupWrapper}>{extraActions}</div>}
        </div>
    ) : (
        <div className={classes.emptyBlock} />
    );
};

export default ExtraActions;
