import React from 'react';
import OrderListSettings from '../../../pages/Settings/OrderListSettings/OrderListSettings';
import classes from './OrderListSettingsPopup.module.scss';
import { useTranslation } from 'react-i18next';
import { Button } from '@jet-pie/react';
import { usePortal } from '@lo/web/hooks/usePortal';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { Modal } from '@jet-pie/react';

type OrderListSettingsPopupProps = {
    isOpen: boolean;
    onClose: () => void;
};

const OrderListSettingsPopup: React.FC<OrderListSettingsPopupProps> = ({ isOpen, onClose }) => {
    const restaurant = useRestaurant();
    const { t } = useTranslation();
    const portal = usePortal();

    return portal(
        <Modal
            title={{ text: t('orders.live_orders_settings.settings_page.orders_list_settings') ?? '' }}
            onClose={onClose}
            isOpen={isOpen}
            variant="wide"
            size="medium"
        >
            <div>
                <OrderListSettings restaurant={restaurant} />
                <div className={classes.buttonContainer}>
                    <Button onClick={onClose} className={classes.confirmButton}>
                        {t('orders.live_orders_order_details.unavailable_items.confirm')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default OrderListSettingsPopup;
