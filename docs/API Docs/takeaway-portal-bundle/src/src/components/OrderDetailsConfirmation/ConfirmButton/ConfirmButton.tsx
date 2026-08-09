import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@jet-pie/react';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import { trainingElements } from '@lo/shared/types/trainings';

type ConfirmButtonProps = {
    isLoading: boolean;
    onClick: () => void;
};

const ConfirmButton: React.FC<ConfirmButtonProps> = ({ isLoading, onClick }) => {
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();

    return (
        <Button
            isLoading={isLoading}
            disabled={isLoading}
            fullWidth
            data-testid="confirm-order-button"
            data-training-id={trainingElements.acceptOrder}
            onClick={onClick}
            size="medium"
            style={{ alignSelf: 'auto', marginTop: isLessThanTabletWidth ? 0 : '20px' }}
        >
            {t('orders.live_orders_order_details.confirmation.accept_order')}
        </Button>
    );
};

export default ConfirmButton;
