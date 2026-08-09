import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import classes from './ConfirmOrderMessage.module.scss';

const ConfirmOrderMessage: React.FC = () => {
    const { t } = useTranslation();

    const words = t('orders.live_orders_order_details.confirmation.change_default_times').split(' ');
    let settingsWord = words.pop() ?? '';
    settingsWord = settingsWord.replace(/\.$/, '');

    return (
        <div className={classes.text}>
            {words.join(' ')}&nbsp;
            <NavLink to="/settings" data-testid="order-details-link-to-settings" className={classes.textLink}>
                {settingsWord}
            </NavLink>
            .
        </div>
    );
};

export default ConfirmOrderMessage;
