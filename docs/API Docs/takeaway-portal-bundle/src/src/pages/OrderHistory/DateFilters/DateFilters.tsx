import React, { useState } from 'react';
import { Calendar } from '@jet-pie/react/esm/icons';
import { Chip, IconButton, useOnClickOutside } from '@jet-pie/react';
import { DateRange as DayPickerDateRange } from 'react-day-picker';
import { getDateRangeLabel } from '@lo/shared/helpers/filters/orderHistoryFilters';
import { useTranslation } from 'react-i18next';
import classes from './DateFilters.module.scss';
import { DateRange } from '@lo/shared/helpers/dates';
import DatePickerPopup from '@lo/web/components/UI/DatePickerPopup/DatePickerPopup';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';

type DateFiltersProps = {
    selected: DateRange;
    onChange: (range: DateRange) => void;
    onReset: () => void;
    type?: 'chip' | 'button';
};

const DateFilters: React.FC<DateFiltersProps> = (props) => {
    const { onChange, onReset, selected, type = 'button' } = props;

    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();
    const [datesPopupOpened, setDatesPopupOpened] = useState(false);
    const { containerRef } = useOnClickOutside(() => !isLessThanTabletWidth && setDatesPopupOpened(false));

    const label = getDateRangeLabel(selected);

    const handleConfirm = (dateRange?: DayPickerDateRange) => {
        if (dateRange && dateRange.from && dateRange.to) {
            onChange([dateRange.from, dateRange.to]);
        } else {
            onReset();
        }
        setDatesPopupOpened(false);
    };

    return (
        <div ref={containerRef} className={classes.container}>
            {type === 'chip' ? (
                <Chip
                    onClick={() => setDatesPopupOpened(true)}
                    onRemove={onReset}
                    label={label || t('orders.live_orders_order_history.filter_types.select_date_range')}
                    selected={!!label}
                    showClose={!!label}
                    className={classes.chip}
                    data-testid="filters-popup-select-date"
                />
            ) : (
                <IconButton
                    data-testid="date_picker_button"
                    variant="secondary"
                    size="medium"
                    icon={<Calendar />}
                    onClick={() => setDatesPopupOpened(!datesPopupOpened)}
                />
            )}
            <DatePickerPopup
                isOpen={datesPopupOpened}
                selected={{ from: selected[0], to: selected[1] }}
                onConfirm={handleConfirm}
                onDismiss={() => setDatesPopupOpened(false)}
            />
        </div>
    );
};

export default DateFilters;
