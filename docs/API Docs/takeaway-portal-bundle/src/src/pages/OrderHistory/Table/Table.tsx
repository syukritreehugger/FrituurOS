import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { Walking } from '@jet-pie/react/esm/icons';
import { Skeleton } from '@jet-pie/react/esm/components/Skeleton';
import RepeaterContainer from '@lo/web/components/UI/RepeaterContainer/RepeaterContainer';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import TableRow from './TableRow/TableRow';
import TableCell from './TableCell/TableCell';
import ColumnHeader from './ColumnHeader/ColumnHeader';
import GoUpButton from './GoUpButton/GoUpButton';
import { colors } from '../../../common/js/colorTokens';
import useOrderHistory from '@lo/shared/hooks/useOrderHistory';
import PaymentTypeIcon from '@lo/web/components/PaymentTypeIcon/PaymentTypeIcon';
import classes from './Table.module.scss';

type TableProps = {
    openOrderDetails: (order: number) => void;
};

const Table: FC<TableProps> = ({ openOrderDetails }) => {
    const { isLessThanTabletWidth } = useWindowSize();
    const { t } = useTranslation();
    const tableBodyRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const { isFetched, isFetching, data: orders } = useOrderHistory();

    const isNotMobile = !isLessThanTabletWidth;

    const handleScroll = (e: any) => {
        setScrollTop(e.target.scrollTop);
    };

    const scrollToTop = () => {
        tableBodyRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, itemId: number) => {
        e.preventDefault();
        openOrderDetails(itemId);
    };

    return (
        <div className={classes.table}>
            {isNotMobile && (
                <div className={cn(classes.tableHeader, { [classes.tableHeaderScrolled]: scrollTop > 0 })}>
                    <TableRow isFetched={isFetched} header>
                        <ColumnHeader columnName="placed_date" />
                        <ColumnHeader columnName="public_reference" />
                        <ColumnHeader columnName="address" />
                        <ColumnHeader columnName="status" />
                        <ColumnHeader columnName="payment" />
                        <ColumnHeader columnName="total" />
                    </TableRow>
                </div>
            )}

            <div
                ref={tableBodyRef}
                className={cn(classes.tableBody, { [classes.tableBodyFetching]: isFetching })}
                onScroll={handleScroll}
                data-testid="table-body"
            >
                {isFetching && (
                    <RepeaterContainer times={20}>
                        <TableRow isFetching>
                            <TableCell>
                                <Skeleton variant="box" width={isLessThanTabletWidth ? '40px' : '52px'} height="20px" />
                            </TableCell>
                            <TableCell>
                                <Skeleton variant="box" width="60px" height="20px" />
                            </TableCell>
                            <TableCell>
                                <Skeleton variant="box" width={isLessThanTabletWidth ? '104px' : '196px'} height="20px" />
                            </TableCell>
                            {isNotMobile && (
                                <TableCell>
                                    <Skeleton variant="box" width="80px" height="20px" />
                                </TableCell>
                            )}
                            {isNotMobile && (
                                <TableCell align="center">
                                    <Skeleton variant="circle" width="20px" height="20px" />
                                </TableCell>
                            )}
                            <TableCell align="right">
                                <Skeleton variant="box" width={isLessThanTabletWidth ? '73px' : '56px'} height="20px" />
                            </TableCell>
                        </TableRow>
                    </RepeaterContainer>
                )}

                {!isFetching &&
                    orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>
                                <span className={classes.text}>{order.time}</span>
                            </TableCell>
                            <TableCell>
                                <a
                                    data-testid={`order-history-item-${order.public_reference}`}
                                    className={cn([classes.link, classes.text])}
                                    onClick={(e) => handleLinkClick(e, order.id)}
                                >
                                    {order.public_reference}
                                </a>
                            </TableCell>
                            <TableCell dataTestId={`order-${order.id}-address`} cutLongText hideForChainAccounts>
                                {order.is_pickup && <Walking width={14} height={14} fill={colors.alias.contentDefault} />}
                                <span className={classes.text}>
                                    {order.address ? order.address : order.customer ? order.customer.full_name : null}
                                </span>
                            </TableCell>
                            {isNotMobile && (
                                <TableCell>
                                    <span
                                        className={cn({
                                            [classes.errorText]: order.is_cancelled,
                                            [classes.successText]: order.is_in_progress,
                                            [classes.text]: !order.is_cancelled && !order.is_in_progress
                                        })}
                                    >
                                        {order.is_cancelled
                                            ? t('orders.live_orders_order_history.main.cancelled')
                                            : order.is_in_progress
                                              ? t('orders.live_orders_order_history.main.in_progress')
                                              : t('orders.live_orders_order_history.main.completed')}
                                    </span>
                                </TableCell>
                            )}
                            {isNotMobile && (
                                <TableCell align="center">
                                    <PaymentTypeIcon
                                        paymentType={order.payment_type}
                                        fill={colors.alias.contentDefault}
                                        showTooltip
                                    />
                                </TableCell>
                            )}
                            <TableCell align="right" cutLongText>
                                {!order.is_cancelled && <span className={classes.text}>{order.total}</span>}
                                {isLessThanTabletWidth && order.is_cancelled && (
                                    <span className={classes.errorText}>
                                        {t('orders.live_orders_order_history.main.cancelled')}
                                    </span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
            </div>

            <GoUpButton visible={scrollTop > 200} onClick={scrollToTop} />
        </div>
    );
};

export default Table;
