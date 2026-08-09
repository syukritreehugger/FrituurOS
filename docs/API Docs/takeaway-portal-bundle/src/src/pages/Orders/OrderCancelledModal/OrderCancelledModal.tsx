import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@jet-pie/react';
import { useOrdersStoreActions } from '@lo/shared/store/orders';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import chefUsingOrderpad from '@lo/web/src/static/images/chef-using-orderpad.png';
import classes from './OrderCancelledModal.module.scss';

type OrderCancelledModalProps = {
    reference: string;
};

const OrderCancelledModal: FC<OrderCancelledModalProps> = ({ reference }) => {
    const restaurant = useRestaurant();
    const actions = useOrdersStoreActions();
    const { t } = useTranslation();

    return (
        <Modal
            isOpen
            onClose={() => actions.viewedOrderCancelledModal(reference)}
            size="small"
            action="acknowledge"
            data-testid="order-cancelled-ok-button"
            primaryAction={{
                text: 'Okay',
                onClick: () => actions.viewedOrderCancelledModal(reference)
            }}
        >
            <div className={classes.image}>
                <img src={chefUsingOrderpad} width="168" height="168" />
            </div>

            <div className={classes.heading} data-testid="order-cancelled-modal-heading">
                {t('orders.live_orders_messages.main.orderid_has_been_cancelled', { orderId: reference })}
            </div>

            {t('orders.live_orders_order_details.order_cancellation.for_more_details_call', {
                phone: restaurant.country_contact_information.phone
            })}
        </Modal>
    );
};

export default OrderCancelledModal;
