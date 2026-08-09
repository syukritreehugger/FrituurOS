import React, { FC, useEffect } from 'react';
import moneyFormat from '@lo/shared/helpers/moneyFormat';
import OrderHistoryItemModel from '@lo/shared/models/OrderHistoryItemModel';
import classes from './TotalBar.module.scss';
import { useTranslation } from 'react-i18next';
import { convertCurrencyApi } from '@lo/shared/api/currency';

type TotalBarProps = {
    isFetching: boolean;
    orders: OrderHistoryItemModel[];
};

const TotalBar: FC<TotalBarProps> = ({ isFetching, orders }) => {
    const { t } = useTranslation();
    const [convertedTotal, setConvertedTotal] = React.useState<string>();

    useEffect(() => {
        const totalsByCurrency = orders.reduce(
            (acc, order) => {
                if (order.is_cancelled) return acc;

                const currency = order.currency;
                if (!acc[currency]) {
                    acc[currency] = order.restaurant_total;
                } else {
                    acc[currency] += order.restaurant_total;
                }

                return acc;
            },
            {} as Record<string, number>
        );

        if (totalsByCurrency.hasOwnProperty('BGN') && totalsByCurrency.hasOwnProperty('EUR')) {
            convertCurrencyApi({ from: 'BGN', to: 'EUR', amount: totalsByCurrency['BGN'] }).then((data) => {
                setConvertedTotal(moneyFormat(data.amount + totalsByCurrency['EUR'], 'EUR'));
            });
        } else {
            const [currency, amount] =
                Object.entries(totalsByCurrency).length > 0 ? Object.entries(totalsByCurrency)[0] : [orders[0]?.currency, 0];
            setConvertedTotal(moneyFormat(amount, currency));
        }
    }, [orders]);

    return (
        <div className={classes.container}>
            {!isFetching && (
                <span data-testid="orders-length">
                    {t('orders.live_orders_order_history.totals.orders')} {orders.length}
                </span>
            )}
            {!isFetching && (
                <span data-testid="orders-total">
                    {t('orders.live_orders_order_history.totals.total')} {convertedTotal}
                </span>
            )}
        </div>
    );
};

export default TotalBar;
