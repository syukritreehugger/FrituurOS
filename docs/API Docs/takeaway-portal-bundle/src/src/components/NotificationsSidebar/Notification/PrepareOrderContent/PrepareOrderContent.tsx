import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@jet-pie/react';
import { OrderData } from '@lo/shared/types/orderDataType';
import { useOrdersStoreActions } from '@lo/shared/store/orders';
import classes from './PrepareOrderContent.module.scss';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';

type PrepareOrderContentProps = {
    order: OrderData;
    onClose: () => void;
};

const PrepareOrderContent: FC<PrepareOrderContentProps> = ({ order, onClose }) => {
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();
    const { openOrderDetails } = useOrdersStoreActions();

    const handleAction = () => {
        openOrderDetails(order.id);
        onClose();
    };

    return (
        <div className={classes.container} data-testid="prepare-order-content">
            <p>{t('orders.live_orders_notifications.prepare_order.full_message')}</p>

            <div className={classes.action}>
                <Button variant="outline" size="xSmall" fullWidth={isLessThanTabletWidth} onClick={handleAction}>
                    {t('orders.live_orders_notifications.prepare_order.action')}
                </Button>
            </div>
        </div>
    );
};

export default PrepareOrderContent;
