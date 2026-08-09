import React from 'react';
import { Modal } from '@jet-pie/react';
import { Product } from '@lo/shared/types/orderDataType';
import { useTranslation } from 'react-i18next';
import classes from './UnavailableItemsPopup.module.scss';
import AlertMessage from '../../UI/AlertMessage/AlertMessage';

type ConfirmModalProps = {
    products: Product[];
    contact: string;
    onClose: () => void;
};

const ConfirmPopup: React.FC<ConfirmModalProps> = (props) => {
    const { products, onClose, contact } = props;
    const { t } = useTranslation();
    return (
        <Modal
            data-testid="confirm-unavailable-items-popup"
            onClose={onClose}
            size="small"
            variant="narrow"
            action="acknowledge"
            title={{
                text:
                    t('orders.live_orders_order_details.unavailable_items.confirm_popup_title') ??
                    'You’ve set some items as out of stock:'
            }}
            primaryAction={{
                text: t('orders.live_orders_order_details.unavailable_items.ok'),
                onClick: onClose
            }}
            isOpen
        >
            {products.length > 0 && (
                <ul className={classes.confirmList}>
                    {products.map((product) => (
                        <li key={product.menu_product_id}>{product.name}</li>
                    ))}
                </ul>
            )}
            <AlertMessage
                message={
                    products.length > 0
                        ? t('orders.live_orders_order_details.unavailable_items.restock_info_message')
                        : t('orders.live_orders_order_details.unavailable_items.cancel_suggestion_message', { contact })
                }
            />
        </Modal>
    );
};

export default ConfirmPopup;
