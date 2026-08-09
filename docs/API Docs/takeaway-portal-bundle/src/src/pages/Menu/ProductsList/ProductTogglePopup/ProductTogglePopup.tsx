import React, { useEffect, useState } from 'react';
import { Modal, TextField } from '@jet-pie/react';
import { ChevronDown } from '@jet-pie/react/esm/icons';
import { datesLocaleMap } from '@lo/shared/helpers/filters/orderHistoryFilters';
import { MenuProduct } from '@lo/shared/types/menuType';
import { startOfTomorrow } from 'date-fns';
import { format } from 'date-fns-tz';
import { DayPicker } from 'react-day-picker';
import { datePickerStyleProps } from '@lo/web/components/UI/DatePicker/DatePicker';
import classes from './ProductTogglePopup.module.scss';
import { useTranslation } from 'react-i18next';

type ProductTogglePopupProps = {
    isOpen: boolean;
    isLoading: boolean;
    product: MenuProduct | null;
    onConfirm: (backToStockAt?: Date) => void;
    onClose: () => void;
};

const ProductTogglePopup: React.FC<ProductTogglePopupProps> = (props) => {
    const { isOpen, isLoading, product, onClose, onConfirm } = props;
    const [isDatesPopupOpened, setIsDatesPopupOpened] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [confirmedDate, setConfirmedDate] = useState<Date | undefined>(undefined);
    const language = localStorage.getItem('lang') || 'en';
    const { t } = useTranslation();

    useEffect(() => {
        setSelectedDate(undefined);
        setConfirmedDate(undefined);
    }, [isOpen]);

    const title =
        t('orders.live_orders_menu.main.remove_item_title', {
            product: product?.name
        }) || `Remove ${product} from the menu`;

    const toggleDatesPopup = () => setIsDatesPopupOpened(!isDatesPopupOpened);
    const confirmSelectedDate = () => {
        setConfirmedDate(selectedDate);
        toggleDatesPopup();
    };
    const cancelSelectedDate = () => {
        setSelectedDate(confirmedDate);
        toggleDatesPopup();
    };

    const handleRemove = () => {
        onConfirm(confirmedDate);
    };

    if (!product) return null;
    return (
        <>
            <Modal
                size="small"
                variant="narrow"
                title={{ text: title }}
                isOpen={isOpen}
                onClose={onClose}
                action="confirm"
                data-testid="product-toggle-popup"
                primaryAction={{ text: t('orders.live_orders_menu.main.remove'), onClick: handleRemove, isLoading }}
                dismissAction={{ text: t('orders.live_orders_menu.main.cancel'), onClick: onClose }}
            >
                <p className={classes.putBackTitle}>{t('orders.live_orders_menu.main.back_in_stock_title')}</p>
                <div className={classes.selectDateInput} onClick={toggleDatesPopup}>
                    <TextField
                        value={confirmedDate ? format(confirmedDate, 'dd/MM/yyyy') : 'DD/MM/YYYY'}
                        suffix={<ChevronDown />}
                        onChange={() => null}
                    />
                </div>
            </Modal>

            <Modal
                data-testid="date_picker_popup"
                isOpen={isDatesPopupOpened}
                onClose={toggleDatesPopup}
                variant="narrow"
                size="small"
                action="confirm"
                primaryAction={{ text: t('orders.live_orders_menu.main.confirm'), onClick: confirmSelectedDate }}
                dismissAction={{ text: t('orders.live_orders_menu.main.cancel'), onClick: cancelSelectedDate }}
            >
                <div className={classes.dayPickerContainer}>
                    <DayPicker
                        mode="range"
                        weekStartsOn={1}
                        numberOfMonths={1}
                        selected={{
                            from: new Date(),
                            to: selectedDate
                        }}
                        disabled={[{ before: startOfTomorrow() }]}
                        fromMonth={new Date()}
                        defaultMonth={selectedDate}
                        onSelect={(range) => range?.to && setSelectedDate(range.to)}
                        locale={datesLocaleMap[language || 'en']}
                        {...datePickerStyleProps}
                    />
                </div>
            </Modal>
        </>
    );
};

export default ProductTogglePopup;
