import React, { useState } from 'react';
import { Button, IconButton } from '@jet-pie/react';
import { useTranslation } from 'react-i18next';
import { Filters as FiltersIcon, Close } from '@jet-pie/react/esm/icons';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import Popup from '@lo/web/components/UI/Popup/Popup';
import Options from './Options/Options';
import DateFilters from '../DateFilters/DateFilters';
import { createDateRange, isSameDateRange } from '@lo/shared/helpers/dates';
import { colors } from '../../../common/js/colorTokens';
import classes from './Filters.module.scss';
import { useOrderHistoryActions, useOrderHistoryDateRange, useOrderHistoryFilters } from '@lo/shared/store/orderHistory';
import analytics from '@lo/shared/services/analytics';

const Filters: React.FC = () => {
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();

    const dateRange = useOrderHistoryDateRange();
    const filters = useOrderHistoryFilters();
    const actions = useOrderHistoryActions();

    const [selectedDateRange, setSelectedDateRange] = useState(dateRange);
    const [selectedStatuses, setSelectedStatuses] = useState(filters.statuses);
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState(filters.paymentMethods);
    const [filtersPopupOpened, setFiltersPopupOpened] = useState(false);

    const filtersValues = [...filters.statuses, ...filters.paymentMethods];
    const newFiltersValues = [...selectedStatuses, ...selectedPaymentMethods];

    const dateRangeIsDefault = isSameDateRange(selectedDateRange, 'today');
    const dateRangeIsChanged = !isSameDateRange(dateRange, selectedDateRange);

    const removedFiltersCount = newFiltersValues.filter((item) => !filtersValues.includes(item)).length;
    const filtersCount = (isLessThanTabletWidth && !dateRangeIsDefault ? 1 : 0) + newFiltersValues.length;
    const appliedFiltersCount =
        (isLessThanTabletWidth && !isSameDateRange(selectedDateRange, 'today') ? 1 : 0) + newFiltersValues.length;

    const selectButtonDisabled =
        removedFiltersCount === 0 &&
        filtersValues.filter((item) => !newFiltersValues.includes(item)).length === 0 &&
        (!isLessThanTabletWidth || !dateRangeIsChanged);

    const title = t('orders.live_orders_order_list.sorting_and_filtering.filter_by') || 'Filter by';

    const handleSelectFilters = () => {
        const newFilters = { statuses: selectedStatuses, paymentMethods: selectedPaymentMethods };

        actions.applyFilters(newFilters);
        analytics.orderHistory.appliedFilters(newFilters);

        if (isLessThanTabletWidth && !isSameDateRange(dateRange, selectedDateRange)) {
            analytics.orderHistory.appliedDateRange(selectedDateRange);
            actions.setDateRange(selectedDateRange);
        }

        togglePopup();
    };

    const handleClearFilters = () => {
        if (isLessThanTabletWidth) {
            analytics.orderHistory.removedAllFilters(filters, dateRange, 'Clear');
            actions.resetDateRange();
        } else {
            analytics.orderHistory.removedAllFilters(filters, undefined, 'Clear');
        }

        actions.resetFilters();

        togglePopup();
    };

    const togglePopup = () => {
        setFiltersPopupOpened(!filtersPopupOpened);
        setSelectedStatuses(filters.statuses);
        setSelectedPaymentMethods(filters.paymentMethods);
        setSelectedDateRange(dateRange);
    };

    return (
        <div className={classes.container}>
            <IconButton
                data-testid="filters-open-button"
                variant="secondary"
                size="medium"
                icon={<FiltersIcon />}
                onClick={togglePopup}
            />

            {isLessThanTabletWidth && appliedFiltersCount > 0 && <div className={classes.badge}>{appliedFiltersCount}</div>}

            <Popup
                dataTestId="filters-popup"
                title={isLessThanTabletWidth ? title : undefined}
                isOpen={filtersPopupOpened}
                bottomSheetHeight="auto"
                width="340px"
                onClose={togglePopup}
                onClickOutsideClose={false}
            >
                {!isLessThanTabletWidth && (
                    <div className={classes.header}>
                        <span>{t('orders.live_orders_order_list.sorting_and_filtering.filter_by') || 'Filter by'}</span>
                        <button className={classes.closeButton} onClick={() => setFiltersPopupOpened(false)}>
                            <Close fill={colors.alias.contentDefault} />
                        </button>
                    </div>
                )}
                <div className={classes.content}>
                    <Options
                        title={t('orders.live_orders_order_history.filter_types.order_status')}
                        selected={selectedStatuses}
                        options={['in_progress', 'delivered', 'cancelled']}
                        onSelectionChanged={(statuses) => setSelectedStatuses(statuses)}
                    />
                    <Options
                        title={t('orders.live_orders_order_history.filter_types.payment_method')}
                        selected={selectedPaymentMethods}
                        options={['cash', 'card']}
                        onSelectionChanged={(payments) => setSelectedPaymentMethods(payments)}
                    />

                    {isLessThanTabletWidth && (
                        <div>
                            <p className={classes.selectDatesTitle}>
                                {t('orders.live_orders_order_history.filter_types.period')}
                            </p>
                            <DateFilters
                                selected={selectedDateRange}
                                onChange={setSelectedDateRange}
                                onReset={() => setSelectedDateRange(createDateRange('today'))}
                                type="chip"
                            />
                        </div>
                    )}
                </div>
                <div className={classes.footer}>
                    <Button
                        data-testid="filters-clear-button"
                        onClick={handleClearFilters}
                        size={isLessThanTabletWidth ? 'medium' : 'small-expressive'}
                        variant="ghost"
                    >
                        {t('orders.live_orders_order_history.actions.filter_popup_clear')}
                    </Button>
                    <Button
                        data-testid="filters-select-button"
                        onClick={handleSelectFilters}
                        disabled={selectButtonDisabled}
                        size={isLessThanTabletWidth ? 'medium' : 'small-expressive'}
                    >
                        {`${t('orders.live_orders_order_history.actions.filter_popup_select')} ${
                            filtersCount ? '(' + filtersCount + ')' : ''
                        }`}
                    </Button>
                </div>
            </Popup>
        </div>
    );
};

export default Filters;
