import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { Button } from '@jet-pie/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Navigate } from 'react-router';
import { useIsChainAccount } from '@lo/shared/store/auth';
import useOrderDetails from '@lo/shared/hooks/useOrderDetails';
import Size58mm from './Size58mm/Size58mm';
import classes from './Receipt.module.scss';
import { FeatureManagerProvider } from '@lo/shared/contexts/FeatureManagerContext';

type ParamTypes = {
    id: string;
};

const Receipt: React.FC = () => {
    const { id } = useParams<ParamTypes>();
    const { t } = useTranslation();
    const isChainAccount = useIsChainAccount();
    const { data: order } = useOrderDetails(id ? parseInt(id) : 0);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return isChainAccount ? (
        <Navigate
            replace
            to={{
                pathname: `/orders`
            }}
        />
    ) : (
        <FeatureManagerProvider>
            <div className={classes.buttons}>
                <button className={classes.backLink} onClick={() => navigate('/orders')} data-testid="back-to-orders-button">
                    {t('orders.live_orders_receipt.main.back_to_orders')}
                </button>
                <Button disabled={!order} size="small-expressive" onClick={window.print}>
                    {t('orders.live_orders_order_details.actions.receipt_print')}
                </Button>
            </div>

            {order && <Size58mm order={order} onLoad={() => setTimeout(window.print, 500)} />}
        </FeatureManagerProvider>
    );
};

export default Receipt;
