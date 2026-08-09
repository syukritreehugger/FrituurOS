import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@jet-pie/react';
import classes from './CensoredText.module.scss';

type CensoredTextProps = {
    placeholderText?: string | ReactElement;
    toolTipText?: string;
    toolTipPosition?: 'right' | 'left';
};

const CensoredText: React.FC<CensoredTextProps> = (props) => {
    const { placeholderText, toolTipText, toolTipPosition } = props;
    const { t } = useTranslation();

    return (
        <>
            <Tooltip
                variant="icon"
                placement={toolTipPosition}
                data-testid="tooltip"
                content={toolTipText ?? t('orders.live_orders_messages.main.gdpr')}
            >
                <span className={classes.blurred} data-testid="placeholder">
                    {placeholderText ?? t('orders.live_orders_messages.main.gdpr')}
                </span>
            </Tooltip>
        </>
    );
};

export default CensoredText;
