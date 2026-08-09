import React, { useEffect, useState } from 'react';
import { Checkbox } from '@jet-pie/react';
import FiltersIcon from '@jet-pie/react/esm/icons/Filters';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import FiltersWrapper from '../FiltersWrapper/FiltersWrapper';
import classes from './Filters.module.scss';
import { useTranslation } from 'react-i18next';
import {
    useOutOfStockFilterActions,
    useOutOfStockFilterAmount,
    useOutOfStockFilterCounter,
    useOutOfStockFilterIsActive
} from '@lo/shared/store/menuOutOfStockFilter';
import analytics from '@lo/shared/services/analytics';

const Filters: React.FC = () => {
    const { t } = useTranslation();
    const isActive = useOutOfStockFilterIsActive();
    const counter = useOutOfStockFilterCounter();
    const amount = useOutOfStockFilterAmount();
    const { toggle } = useOutOfStockFilterActions();
    const { isLessThanDesktopWidth } = useWindowSize();
    const [isOutOfStockFilterChecked, setIsOutOfStockFilterChecked] = useState(isActive);
    const outOfStockItemsPercentage = 100 - (counter / amount) * 100;

    useEffect(() => {
        setIsOutOfStockFilterChecked(isActive);
    }, [isActive]);

    const handleToggleOutOfStockFilter = () => {
        if (isOutOfStockFilterChecked) analytics.menu.turnedOffOutOfStockFilter('toggle');
        else analytics.menu.turnedOnOutOfStockFilter();

        if (isLessThanDesktopWidth) setIsOutOfStockFilterChecked(!isOutOfStockFilterChecked);
        else toggle();
    };

    const handleConfirmToggle = () => {
        if (isOutOfStockFilterChecked !== isActive) {
            toggle();
        }
    };

    return (
        <FiltersWrapper onConfirm={handleConfirmToggle} badgeCounter={isActive ? 1 : undefined}>
            {!isLessThanDesktopWidth ? (
                <div className={classes.titleContainer}>
                    <FiltersIcon width={21} height={21} />
                    <p className={classes.title}>{t('orders.live_orders_menu.main.filters_title')}</p>
                </div>
            ) : null}
            <div className={classes.outOfStockToggleContainer}>
                <p className={classes.outOfStockToggleTitle}>
                    {`${t('orders.live_orders_menu.main.show_out_of_stock_items_only')} (${counter})`}
                </p>
                <Checkbox
                    data-testid={`toggle-out-of-stock-filter-${isActive ? 'on' : 'off'}`}
                    checked={isLessThanDesktopWidth ? isOutOfStockFilterChecked : isActive}
                    value="out-of-stock-toggle"
                    name="out-of-stock-toggle"
                    onChange={handleToggleOutOfStockFilter}
                />
            </div>
            <div className={classes.stockLevelContainer}>
                <p className={classes.stockLevelTitle}>{t('orders.live_orders_menu.main.stock_level')}</p>
                <div className={classes.stockLevelProgressTitleContainer}>
                    <p className={classes.stockLevelProgressTitle}>{t('orders.live_orders_menu.main.total_items')}</p>
                    <p className={classes.stockLevelProgressItemsCount}>
                        {amount === 1
                            ? t('orders.live_orders_menu.main.items_amount_singular')
                            : t('orders.live_orders_menu.main.items_amount', { amount: amount })}
                    </p>
                </div>
                <div className={classes.stockLevelProgressContainer}>
                    <div className={classes.stockLevelProgressBar} style={{ width: `${outOfStockItemsPercentage}%` }} />
                </div>
                <p className={classes.stockLevelOutOfStockItemsCount}>
                    {t('orders.live_orders_menu.main.out_of_stock_items_amount', { amount: counter })}
                </p>
            </div>
        </FiltersWrapper>
    );
};

export default Filters;
