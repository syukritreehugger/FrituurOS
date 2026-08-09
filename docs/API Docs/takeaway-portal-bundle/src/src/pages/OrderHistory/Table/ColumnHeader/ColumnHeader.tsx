import React from 'react';
import classes from './ColumnHeader.module.scss';
import SortAscending from '@jet-pie/react/esm/icons/SortAscending';
import SortDescending from '@jet-pie/react/esm/icons/SortDescending';
import Sort from '@jet-pie/react/esm/icons/Sort';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useOrderHistoryActions, useOrderHistorySorting } from '@lo/shared/store/orderHistory';
import { colors } from '../../../../common/js/colorTokens';
import { OrderHistorySortingColumn } from '@lo/shared/types/orderHistoryType';

type ColumnHeaderProps = {
    columnName: OrderHistorySortingColumn;
};

const translationsMap = {
    placed_date: 'orders.live_orders_order_history.table_header.time',
    public_reference: 'orders.live_orders_order_history.table_header.Order',
    address: 'orders.live_orders_order_history.table_header.address',
    status: 'orders.live_orders_order_history.table_header.status',
    payment: 'orders.live_orders_order_history.table_header.payment',
    total: 'orders.live_orders_order_history.table_header.total'
};

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ columnName }) => {
    const { t } = useTranslation();
    const { setSorting } = useOrderHistoryActions();
    const sorting = useOrderHistorySorting();

    const handleClick = () => {
        const newDirection = columnName === sorting.column && sorting.direction === 'asc' ? 'desc' : 'asc';
        setSorting(columnName, newDirection);
    };

    return (
        <div className={classes.wrapper} data-testid={`order-history-column-${columnName}`} onClick={handleClick}>
            <div
                className={classNames(
                    classes.container,
                    columnName === 'payment' && classes.center,
                    columnName === 'total' && classes.right
                )}
            >
                <span className={classes.text}>{t(translationsMap[columnName])}</span>
                {sorting.column === columnName ? (
                    sorting.direction === 'desc' ? (
                        <SortDescending width={14} height={14} fill={colors.alias.contentDefault} className={classes.sortIcon} />
                    ) : (
                        <SortAscending width={14} height={14} fill={colors.alias.contentDefault} className={classes.sortIcon} />
                    )
                ) : (
                    <Sort width={14} height={14} fill={colors.alias.contentDefault} className={classes.sortIcon} />
                )}
            </div>
        </div>
    );
};

export default ColumnHeader;
