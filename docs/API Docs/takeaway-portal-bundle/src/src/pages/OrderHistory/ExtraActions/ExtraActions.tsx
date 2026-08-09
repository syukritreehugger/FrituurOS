import React, { useState } from 'react';
import { Close, Download, MoreVertical, Printer } from '@jet-pie/react/esm/icons';
import { IconButton, useOnClickOutside } from '@jet-pie/react';
import cn from 'classnames';
import classes from './ExtraActions.module.scss';
import { OrderHistoryExportType } from '@lo/shared/types/orderHistoryType';
import { useTranslation } from 'react-i18next';
import analytics from '@lo/shared/services/analytics';
import { getOrderHistoryExportApi } from '@lo/shared/api/orders';
import { useOrderHistoryDateRange, useOrderHistoryFilters, useOrderHistorySorting } from '@lo/shared/store/orderHistory';
import { format } from 'date-fns';
import { CARD_PAYMENT_TYPES_SET } from '@lo/shared/constants';
import { trainingElements } from '@lo/shared/types/trainings';

const ExtraActions: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { containerRef } = useOnClickOutside(() => setIsOpen(false));
    const { t } = useTranslation();
    const dateRange = useOrderHistoryDateRange();
    const filters = useOrderHistoryFilters();
    const sorting = useOrderHistorySorting();

    const paymentMethods = [...filters.paymentMethods] as string[];

    if (paymentMethods.includes('card')) {
        paymentMethods.push(...CARD_PAYMENT_TYPES_SET);
    }

    const handlePrint = () => {
        analytics.orderHistory.exported('print');

        getOrderHistoryExportApi({
            dateFrom: dateRange[0],
            dateTo: dateRange[1],
            sortingColumn: sorting.column,
            sortingDirection: sorting.direction,
            statuses: filters.statuses,
            paymentMethods,
            exportType: 'pdf'
        }).then((response) => window.open(window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }))));

        setIsOpen(false);
    };

    const handleDownload = (exportType: OrderHistoryExportType) => {
        analytics.orderHistory.exported(exportType);

        getOrderHistoryExportApi({
            dateFrom: dateRange[0],
            dateTo: dateRange[1],
            sortingColumn: sorting.column,
            sortingDirection: sorting.direction,
            statuses: filters.statuses,
            paymentMethods,
            exportType
        }).then((response) => {
            const link = document.createElement('a');
            link.setAttribute('download', `${format(new Date(), 'y-m-d_H:i:s')}.${exportType}`);
            link.href = window.URL.createObjectURL(new Blob([response]));
            link.click();
            link.remove();
        });

        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={classes.container} data-training-id={trainingElements.orderHistoryDownload}>
            <IconButton
                variant="secondary"
                size="medium"
                icon={isOpen ? <Close /> : <MoreVertical />}
                className={cn(classes.moreButton, isOpen && classes.moreButtonOpen)}
                onClick={() => setIsOpen(!isOpen)}
                data-testid="order-history-extra-actions-button"
            />

            <div className={cn(classes.popup, isOpen && classes.popupOpen)}>
                <div className={classes.actionsList}>
                    <button data-testid="order-history-print-pdf" className={classes.action} onClick={handlePrint}>
                        <Printer width={21} height={21} />
                        <p className={classes.actionTitle}>{t('orders.live_orders_order_history.actions.print')}</p>
                    </button>
                    <button
                        data-testid="order-history-download-pdf"
                        className={classes.action}
                        onClick={() => handleDownload('pdf')}
                    >
                        <Download width={21} height={21} />
                        <p className={classes.actionTitle}>
                            {t('orders.live_orders_order_history.actions.download', { type: 'PDF' })}
                        </p>
                    </button>
                    <button
                        data-testid="order-history-download-csv"
                        className={classes.action}
                        onClick={() => handleDownload('csv')}
                    >
                        <Download width={21} height={21} />
                        <p className={classes.actionTitle}>
                            {t('orders.live_orders_order_history.actions.download', { type: 'CSV' })}
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExtraActions;
