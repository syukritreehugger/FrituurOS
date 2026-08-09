import React, { useEffect } from 'react';
import { TextField } from '@jet-pie/react';
import CloseIcon from '@jet-pie/react/esm/icons/Close';
import SearchIcon from '@jet-pie/react/esm/icons/Search';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import { useTranslation } from 'react-i18next';
import {
    useSearchFilterActions,
    useSearchFilterIsActive,
    useSearchFilterResults,
    useSearchFilterValue
} from '@lo/shared/store/menuSearchFilter';
import analytics from '@lo/shared/services/analytics';
import SearchResultItem from '../SearchResultItem/SearchResultItem';
import classes from './Search.module.scss';
import { trainingElements } from '@lo/shared/types/trainings';

const Search: React.FC = () => {
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();
    const { clear, apply, update } = useSearchFilterActions();

    useEffect(() => {
        clear();
    }, []);

    const value = useSearchFilterValue();
    const isActive = useSearchFilterIsActive();
    const results = useSearchFilterResults();
    const foundedItemsCount = results.length;
    const searchPlaceholder = isLessThanTabletWidth
        ? t('orders.live_orders_menu.main.mobile_search_placeholder')
        : t('orders.live_orders_menu.main.desktop_search_placeholder');

    const onClearClick = () => {
        analytics.menu.clearedSearch(value);
        clear();
    };

    const onShowMoreResultsClick = () => {
        analytics.menu.clickedOnShowMoreResults(value);
        apply();
    };

    const onFoundItemClick = (name: string) => {
        analytics.menu.clickedOnSearchListItem(value);
        apply(name);
    };

    return (
        <div className={classes.searchContainer} data-training-id={trainingElements.menuProduct}>
            <TextField
                type="search"
                width="100%"
                prefix={<SearchIcon />}
                suffix={value && <CloseIcon />}
                onSuffixClick={onClearClick}
                data-testid="menu-search-filter"
                placeholder={searchPlaceholder}
                onChange={(e) => update(e.target.value)}
                onKeyUp={(e) => e.code === 'Enter' && apply()}
                onFocus={() => analytics.menu.clickedOnSearch()}
                value={value}
            />
            {!isActive && foundedItemsCount > 0 && (
                <div className={classes.searchResultsDropdownWrapper}>
                    <div className={classes.searchResultsDropdown}>
                        <div className={classes.searchResultItemsList}>
                            {results.slice(0, 5).map((result) => (
                                <SearchResultItem key={result.id} result={result} onClick={onFoundItemClick} />
                            ))}
                        </div>
                        {foundedItemsCount > 5 && (
                            <div
                                data-testid="menu-search-more-results"
                                onClick={onShowMoreResultsClick}
                                className={classes.searchMoreResults}
                            >
                                {foundedItemsCount - 5 === 1
                                    ? t('orders.live_orders_menu.main.more_results_singular')
                                    : t('orders.live_orders_menu.main.more_results', { amount: foundedItemsCount - 5 })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;
