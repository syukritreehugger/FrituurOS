import React, { FC, useEffect, useState } from 'react';
import { Link, Tooltip } from '@jet-pie/react';
import useOrderHistory from '@lo/shared/hooks/useOrderHistory';
import usePinProtection from '@lo/shared/hooks/usePinProtection';
import SkeletonContainer from '@lo/web/components/UI/SkeletonContainer/SkeletonContainer';
import DetailsModal from './DetailsModal/DetailsModal';
import Table from './Table/Table';
import TotalBar from './TotalBar/TotalBar';
import FiltersBar from './FiltersBar/FiltersBar';
import DateFilters from './DateFilters/DateFilters';
import Filters from './Filters/Filters';
import Search from './Search/Search';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import classes from './OrderHistory.module.scss';
import cs from 'classnames';
import Tutorial from '@lo/web/components/Tutorial/Tutorial';
import { useTranslation } from 'react-i18next';
import ExtraActions from './ExtraActions/ExtraActions';
import { DateRange, isSameDateRange } from '@lo/shared/helpers/dates';
import { InfoCircle } from '@jet-pie/react/esm/icons';
import { colors } from '../../common/js/colorTokens';
import {
    useOrderHistoryActions,
    useOrderHistoryDateRange,
    useOrderHistoryFiltersValues,
    useOrderHistorySearch
} from '@lo/shared/store/orderHistory';
import { useNavigate } from 'react-router';
import { useTutorial } from '@lo/web/hooks/useTutorial';
import analytics from '@lo/shared/services/analytics';

const OrderHistory: FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();

    const dates = useOrderHistoryDateRange();
    const search = useOrderHistorySearch();
    const filters = useOrderHistoryFiltersValues();
    const actions = useOrderHistoryActions();
    const [openedOrderId, setOpenedOrderId] = useState<number | null>(null);

    const { data: orders, isFetched, isLoading, isFetching, refetch } = useOrderHistory();
    const { pinIsChecked, checkPin } = usePinProtection(() => navigate('/orders'));

    const filtersValues = Object.values(filters).flat();
    const filtersApplied = filtersValues.length > 0 || search.value.length > 0 || !isSameDateRange(dates, 'today');
    const restaurantHasNoOrders = isFetched && orders.length === 0;
    const noOrdersFoundByFiltering = isFetched && !isFetching && orders.length === 0 && filtersApplied;
    const showTable = orders.length > 0 || isFetching || (!pinIsChecked && !isFetched);
    const { getTutorialRef, ...tutorial } = useTutorial('orderHistoryOFL');

    const onChangeDateRange = (range: DateRange) => {
        if (!isSameDateRange(range, dates)) {
            analytics.orderHistory.appliedDateRange(range);
            actions.setDateRange(range);
        }
    };

    useEffect(() => {
        if (pinIsChecked) {
            refetch();
        } else {
            checkPin();
        }
    }, [pinIsChecked]);

    return (
        <div className={classes.wrapper}>
            <div className={cs(classes.container, { [classes.searchActive]: search.isActive })}>
                <Tutorial {...tutorial} scrollToElement={false} />
                <div className={classes.headerContainer}>
                    <div className={classes.header}>
                        <SkeletonContainer width="128px" height="24px" isLoading={isLoading}>
                            <p className={classes.title}>{t('orders.live_orders_order_history.main.order_history')}</p>
                            <p className={classes.subtitle}>{t('orders.live_orders_order_history.main.subtitle')}</p>
                            <div className={classes.tooltipContainer}>
                                <Tooltip
                                    placement="bottom-end"
                                    width="158px"
                                    content={t('orders.live_orders_order_history.main.subtitle')}
                                >
                                    <InfoCircle width={21} height={21} fill={colors.alias.interactiveBrand} />
                                </Tooltip>
                            </div>
                        </SkeletonContainer>
                    </div>
                    <div className={classes.input}>
                        <SkeletonContainer width={isLessThanTabletWidth ? '100%' : '339px'} height="48px" isLoading={isLoading}>
                            <Search />
                        </SkeletonContainer>
                    </div>
                    <div className={classes.calendarButton}>
                        <SkeletonContainer width="48px" height="48px" isLoading={isLoading} variant="circle">
                            <DateFilters selected={dates} onChange={onChangeDateRange} onReset={actions.resetDateRange} />
                        </SkeletonContainer>
                    </div>
                    <SkeletonContainer width="48px" height="48px" isLoading={isLoading} variant="circle">
                        <Filters />
                    </SkeletonContainer>
                    <div ref={getTutorialRef()}>
                        <SkeletonContainer width="48px" height="48px" isLoading={!isFetched} variant="circle">
                            <ExtraActions />
                        </SkeletonContainer>
                    </div>
                </div>

                <div>
                    <FiltersBar />
                </div>

                {restaurantHasNoOrders && !filtersApplied && !isFetching && (
                    <div className={classes.noOrdersMessage} data-testid="no-orders-message">
                        {t('orders.live_orders_order_history.main.empty_ofl')}
                    </div>
                )}

                {noOrdersFoundByFiltering && (
                    <div className={classes.noOrdersMessage}>
                        {search.value && (
                            <div className={classes.noResultsFor}>
                                {t('orders.live_orders_menu.main.search_results_amount', { amount: search.results.length })}
                                {` \'${search.value}\'`}
                            </div>
                        )}

                        <span>{t('orders.live_orders_order_list.search.no_orders_found')}</span>

                        {search.value && (
                            <Link
                                label={t('orders.live_orders_order_list.search.clear_search')}
                                onClick={actions.searchClear}
                                underlined
                            />
                        )}
                    </div>
                )}

                {search.value && search.isActive && search.results.length > 0 && (
                    <div className={classes.resultsFor}>
                        {t('orders.live_orders_menu.main.search_results_amount', { amount: search.results.length })}
                        <span className={classes.searchValue}>{` \'${search.value}\'`}</span>
                    </div>
                )}

                {showTable && <Table openOrderDetails={setOpenedOrderId} />}

                <div className={classes.footer}>
                    <TotalBar isFetching={isFetching} orders={orders} />
                </div>

                <DetailsModal orderId={openedOrderId} onClose={() => setOpenedOrderId(null)} />
            </div>
        </div>
    );
};

export default OrderHistory;
