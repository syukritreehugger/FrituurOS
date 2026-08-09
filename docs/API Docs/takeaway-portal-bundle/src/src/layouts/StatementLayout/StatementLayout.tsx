import React, { PropsWithChildren } from 'react';
import { RouteProps, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import classes from './StatementLayout.module.scss';

const StatementLayout: React.FC<PropsWithChildren<RouteProps>> = (props) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className={classes.container}>
            <div className={classes.wrapper}>
                <button className={classes.goBackButton} onClick={() => navigate('/orders')}>
                    {t('orders.live_orders_receipt.main.back_to_orders')}
                </button>

                {props.children}
            </div>
        </div>
    );
};

export default StatementLayout;
