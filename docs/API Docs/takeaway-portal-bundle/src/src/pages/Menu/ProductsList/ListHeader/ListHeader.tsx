import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    useOutOfStockFilterCounter,
    useOutOfStockFilterIsActive,
    useOutOfStockProductIds
} from '@lo/shared/store/menuOutOfStockFilter';
import {
    useSearchFilterActions,
    useSearchFilterIsActive,
    useSearchFilterResults,
    useSearchFilterValue
} from '@lo/shared/store/menuSearchFilter';
import classes from './ListHeader.module.scss';
import ToggleSwitcher from '@lo/web/components/UI/ToggleSwitcher/ToggleSwitcher';
import { MenuCategory } from '@lo/shared/types/menuType';
import { useUpdateProduct } from '@lo/shared/hooks/useUpdateProduct';

type ListHeaderProps = {
    menuCategories: MenuCategory[];
};

const ListHeader: React.FC<ListHeaderProps> = (props) => {
    const { menuCategories } = props;
    const { t } = useTranslation();
    const isOutOfStockFilterActive = useOutOfStockFilterIsActive();
    const outOfStockFilterCounter = useOutOfStockFilterCounter();
    const isSearchFilterActive = useSearchFilterIsActive();
    const searchFilterResults = useSearchFilterResults();
    const searchFilterValue = useSearchFilterValue();
    const outOfStockProductIds = useOutOfStockProductIds();
    const { clear: clearSearchFilter } = useSearchFilterActions();
    const { takeAllOnline, isPending } = useUpdateProduct();

    const showSearchResultsInfo = isSearchFilterActive && searchFilterResults.length > 0;
    const showOutOfStockInfo = !isSearchFilterActive && isOutOfStockFilterActive && outOfStockFilterCounter > 0;
    const unavailableProductsIds = menuCategories
        .flatMap((category) => category.products)
        .filter((product) => product?.sold_out)
        .map((product) => (product ? product.id.toString() : ''))
        .filter((item) => item !== '');

    const onPutAllBackToggle = () => {
        takeAllOnline(showSearchResultsInfo ? unavailableProductsIds : outOfStockProductIds.map((product) => product.toString()));
    };

    if (!showSearchResultsInfo && !showOutOfStockInfo) return null;
    return (
        <div className={classes.listHeader}>
            <div className={classes.listHeaderOutOfStockContainer}>
                {showSearchResultsInfo && (
                    <p className={classes.listHeaderTitle}>
                        {searchFilterResults.length === 1
                            ? t('orders.live_orders_menu.main.search_results_amount_singular')
                            : t('orders.live_orders_menu.main.search_results_amount', { amount: searchFilterResults.length })}
                        <span className={classes.highlightedText}>{` \'${searchFilterValue}\'`}</span>
                    </p>
                )}
                {!isSearchFilterActive && showOutOfStockInfo && (
                    <p className={classes.listHeaderTitle}>
                        <span className={classes.highlightedText}>
                            {`(${outOfStockFilterCounter}) ${t('orders.live_orders_menu.main.items_amount', {
                                amount: undefined
                            })} `}
                        </span>
                        {t('orders.live_orders_menu.main.out_of_stock_items_amount', { amount: undefined })}
                    </p>
                )}
                <div className={classes.putAllBackContainer}>
                    <p className={classes.putAllBackTitle}>{t('orders.live_orders_menu.main.put_all_back_title')}</p>
                    <ToggleSwitcher
                        dataTestId={`toggle-switcher-put-all-back`}
                        loading={isPending}
                        disabled={unavailableProductsIds.length === 0}
                        toggleSwitcher={onPutAllBackToggle}
                        isSwitcherOn={false}
                    />
                </div>
            </div>
            {isSearchFilterActive && searchFilterResults.length > 0 && (
                <button className={classes.clearButton} onClick={clearSearchFilter}>
                    {t('orders.live_orders_order_list.search.clear_search')}
                </button>
            )}
        </div>
    );
};

export default ListHeader;
