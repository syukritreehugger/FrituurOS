import React, { FC } from 'react';
import { TextField } from '@jet-pie/react';
import { Close, Search as SearchIcon } from '@jet-pie/react/esm/icons';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import { useTranslation } from 'react-i18next';
import { useOrderHistoryActions, useOrderHistorySearch } from '@lo/shared/store/orderHistory';
import { splitStringAtTarget } from '@lo/shared/helpers/string/splitStringAtTarget';
import classes from './Search.module.scss';
import useOrderHistory from '@lo/shared/hooks/useOrderHistory';
import { searchOrderHistoryItems } from '@lo/shared/helpers/filters/orderHistoryFilters';

const Search: FC = () => {
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();
    const { value, results } = useOrderHistorySearch();
    const { searchClear, searchApply, searchUpdate, searchSetResults } = useOrderHistoryActions();
    const { data: orders } = useOrderHistory();
    const { isActive } = useOrderHistorySearch();

    const foundResults = results.length;

    const getHighlightedString = (text: string) => {
        const labelParts = splitStringAtTarget(text, value);

        if (!labelParts) return text;
        return labelParts?.map((part) => (
            <span
                key={part.key}
                data-testid={part.isHighlighted && 'highlighted-text'}
                className={part.isHighlighted ? classes.highlightedText : undefined}
            >
                {part.text}
            </span>
        ));
    };

    const onTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        searchUpdate(e.target.value);
        searchSetResults(searchOrderHistoryItems(orders, e.target.value));
    };

    return (
        <div className={classes.input}>
            <TextField
                data-testid="order-history-search"
                type="search"
                width={isLessThanTabletWidth ? '100%' : '338px'}
                onChange={onTextFieldChange}
                placeholder={
                    t('orders.live_orders_order_history.sorting_filtering.searchbar_placeholder') ||
                    'Type order #, name or address'
                }
                prefix={<SearchIcon width={18} height={18} />}
                suffix={value && <Close width={14} height={14} />}
                onKeyUp={(e) => e.code === 'Enter' && searchApply()}
                onSuffixClick={searchClear}
                maxChar={20}
                value={value}
            />
            {!isActive && value && (
                <div className={classes.searchResultsDropdownWrapper}>
                    <div className={classes.searchResultsDropdown}>
                        {foundResults > 0 &&
                            results.slice(0, 5).map((orderHistoryItem) => (
                                <div
                                    key={orderHistoryItem.id}
                                    className={classes.searchResultItem}
                                    onClick={searchApply}
                                    data-testid={`order-history-search-item-${orderHistoryItem.public_reference}`}
                                >
                                    {getHighlightedString(orderHistoryItem.public_reference)}
                                </div>
                            ))}
                        {foundResults === 0 && (
                            <div className={classes.noSearchResultsText}>
                                {t('orders.live_orders_order_list.search.no_orders_found')}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;
