import React, { FC } from 'react';
import { DateRange } from 'react-day-picker';
import { BottomSheet } from '@jet-pie/react';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import FadeBackground from '../FadeBackground/FadeBackground';
import DatePicker from '../DatePicker/DatePicker';
import classes from './DatePickerPopup.module.scss';

type DatePickerPopupProps = {
    selected: DateRange;
    fromDate?: Date;
    onConfirm: (dates?: DateRange) => void;
    onDismiss: () => void;
    isOpen: boolean;
};

const DatePickerPopup: FC<DatePickerPopupProps> = (props) => {
    const { selected, fromDate, isOpen, onConfirm, onDismiss } = props;
    const { isLessThanTabletWidth, width } = useWindowSize();

    if (!isOpen) return null;

    if (isLessThanTabletWidth) {
        return (
            <BottomSheet
                onClose={onDismiss}
                headerTitle="Period"
                headerContentModifiers="default"
                height="auto"
                isOpened
                shouldCloseOnOverlayClick
                hasBodyPadding={false}
            >
                <DatePicker onConfirm={onConfirm} onDismiss={onDismiss} selected={selected} fromDate={fromDate} />
            </BottomSheet>
        );
    }

    return (
        <>
            <div className={classes.popup} data-testid="date_picker_popup">
                <DatePicker onConfirm={onConfirm} onDismiss={onDismiss} selected={selected} fromDate={fromDate} />
            </div>
            <FadeBackground isVisible={width < 1150} onClickBackground={onDismiss} />
        </>
    );
};

export default DatePickerPopup;
