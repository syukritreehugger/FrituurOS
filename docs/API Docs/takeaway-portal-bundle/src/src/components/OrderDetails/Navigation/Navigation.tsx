import React from 'react';
import { IconButton } from '@jet-pie/react';
import { ChevronLeft } from '@jet-pie/react/esm/icons';
import { useTranslation } from 'react-i18next';
import { OrderModel } from '@lo/shared/models';
import ExtraActions from '../ExtraActions/ExtraActions';
import { ExtraActionsParams } from '../hooks/useExtraActions';
import classes from './Navigation.module.scss';
import useOrders from '@lo/shared/hooks/useOrders';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import { orderStatus } from '@lo/shared/enums/orderStatusesEnum';
import useRestaurant from '@lo/shared/hooks/useRestaurant';

type NavigationProps = {
    order: OrderModel;
    onClose: () => void;
    extraActions: ExtraActionsParams;
};

const Navigation: React.FC<NavigationProps> = (props) => {
    const { order, onClose, extraActions } = props;

    const { isLessThanTabletWidth } = useWindowSize();
    const { t } = useTranslation();
    const restaurant = useRestaurant();
    const { data } = useOrders();

    const orders = data?.array ?? [];
    const newOrdersCount = orders.filter((o) => o.is_new).length;

    let title = t('orders.live_orders_order_details.titles.title_new');

    switch (order.status) {
        case orderStatus.CONFIRMED:
        case orderStatus.KITCHEN:
            title = t(`orders.live_orders_order_list.tabs.${restaurant.is_grocery_unified_flow ? 'pick' : 'prepare'}`);
            break;
        case orderStatus.IN_DELIVERY:
            title = t('orders.live_orders_order_list.tabs.handover');
            break;
        case orderStatus.DELIVERED:
            title = t('orders.live_orders_order_list.tabs.done');
            break;
        case orderStatus.CANCELLED:
            title = t('orders.live_orders_order_list.statuses.cancelled');
            break;
    }

    return (
        <div className={classes.navigation}>
            {!order.is_new && (
                <IconButton
                    data-testid="close-order-details"
                    size="x-small"
                    variant="ghost"
                    onClick={onClose}
                    icon={<ChevronLeft />}
                />
            )}

            <div data-testid="order-details-header-title" className={classes.title}>
                {order.is_new && <span className={classes.newOrdersCount}>{newOrdersCount}</span>}

                {title}
            </div>

            {isLessThanTabletWidth && (
                <ExtraActions
                    order={order}
                    opened={extraActions.opened}
                    toggleOpened={extraActions.toggle}
                    openOrderListSettingsPopup={extraActions.toggleOrderListSettingsPopup}
                    openUnavailableItemsPopup={extraActions.toggleUnavailableItemsPopup}
                    toggleUpdateConfirmedTimes={extraActions.toggleUpdateConfirmedTimes}
                />
            )}
        </div>
    );
};

export default Navigation;
