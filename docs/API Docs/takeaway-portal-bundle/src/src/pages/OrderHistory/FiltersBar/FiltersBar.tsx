import React from 'react';
import { Chip, Link } from '@jet-pie/react';
import { useTranslation } from 'react-i18next';
import { getFilterTitle, getDateRangeLabel } from '@lo/shared/helpers/filters/orderHistoryFilters';
import analytics from '@lo/shared/services/analytics';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import classes from './FiltersBar.module.scss';
import {
    OrderHistoryFilterValue,
    useOrderHistoryActions,
    useOrderHistoryDateRange,
    useOrderHistoryFilters
} from '@lo/shared/store/orderHistory';
import { getDateRangeName } from '@lo/shared/helpers/dates';

const FiltersBar: React.FC = () => {
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();
    const dateRange = useOrderHistoryDateRange();
    const filters = useOrderHistoryFilters();
    const actions = useOrderHistoryActions();

    const filtersValues = Object.values(filters).flat();
    const filtersApplied = filtersValues.length > 0;
    const dateFilterLabel = getDateRangeLabel(dateRange);

    if ((!filtersApplied && !dateFilterLabel) || isLessThanTabletWidth) return null;

    return (
        <div data-testid="filters-bar-container" className={classes.container}>
            {filters.statuses.map((value: OrderHistoryFilterValue) => (
                <Chip
                    selected
                    key={value}
                    onClick={() => undefined}
                    onRemove={() => {
                        actions.removeFilterValue('statuses', value);
                        analytics.orderHistory.removedFilter('order_status_filter', value, getFilterTitle(value));
                    }}
                    label={getFilterTitle(value)}
                    variant="outlined"
                    showClose
                    data-testid={`filters-bar-${value}`}
                />
            ))}

            {filters.paymentMethods.map((value: OrderHistoryFilterValue) => (
                <Chip
                    selected
                    key={value}
                    onClick={() => undefined}
                    onRemove={() => {
                        actions.removeFilterValue('paymentMethods', value);
                        analytics.orderHistory.removedFilter('payment_method_filter', value, getFilterTitle(value));
                    }}
                    label={getFilterTitle(value)}
                    variant="outlined"
                    showClose
                    data-testid={`filters-bar-${value}`}
                />
            ))}

            {dateFilterLabel && (
                <Chip
                    selected
                    onClick={() => undefined}
                    onRemove={() => {
                        actions.resetDateRange();

                        analytics.orderHistory.removedFilter(
                            'date_range_filter',
                            getDateRangeName(dateRange) ?? 'custom',
                            dateFilterLabel
                        );
                    }}
                    label={dateFilterLabel}
                    variant="outlined"
                    showClose
                    data-testid="filters-bar-dates"
                />
            )}

            {(filtersValues.length > 1 || (filtersValues.length === 1 && !!dateFilterLabel)) && (
                <Link
                    className={classes.clearLink}
                    label={t('orders.live_orders_order_history.sorting_filtering.clear_filters')}
                    onClick={() => {
                        analytics.orderHistory.removedAllFilters(filters, dateRange, 'Clear All');
                        actions.resetFilters();
                        actions.resetDateRange();
                    }}
                    underlined
                    data-testid="filters-bar-clear-filters"
                />
            )}
        </div>
    );
};

export default FiltersBar;
