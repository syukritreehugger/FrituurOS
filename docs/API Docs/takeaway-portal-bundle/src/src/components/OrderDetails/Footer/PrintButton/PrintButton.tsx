import React from 'react';
import { Button } from '@jet-pie/react';
import { useTranslation } from 'react-i18next';
import { Printer } from '@jet-pie/react/esm/icons';
import { colors } from '../../../../common/js/colorTokens';

type PrintButtonProps = {
    disabled: boolean;
    fullWidth: boolean;
    onClick: () => void;
};

const PrintButton: React.FC<PrintButtonProps> = ({ disabled, fullWidth, onClick }) => {
    const { t } = useTranslation();

    return (
        <Button
            onClick={onClick}
            data-testid="print-order-receipt"
            disabled={disabled}
            variant="outline"
            size="medium"
            icon={<Printer fill={colors.alias.contentBrand} />}
            fullWidth={fullWidth}
        >
            {t('orders.live_orders_order_details.actions.order_print')}
        </Button>
    );
};

export default PrintButton;
