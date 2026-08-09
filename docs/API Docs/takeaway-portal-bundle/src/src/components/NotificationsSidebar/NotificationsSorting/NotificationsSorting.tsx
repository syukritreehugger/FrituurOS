import React, { useState } from 'react';
import classes from './NotificationsSorting.module.scss';
import { IconButton } from '@jet-pie/react';
import Popup from '../../UI/Popup/Popup';
import { Close, Sort } from '@jet-pie/react/esm/icons';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

type NotificationsSortingProps = {
    selected: 'desc' | 'asc';
    onChange: (sorting: 'desc' | 'asc') => void;
};

const NotificationsSorting: React.FC<NotificationsSortingProps> = (props) => {
    const { selected, onChange } = props;
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const handleSortingChange = (sorting: 'asc' | 'desc') => {
        setIsOpen(false);
        onChange(sorting);
    };

    return (
        <div className={classes.container}>
            <IconButton
                variant="secondary"
                size="x-small"
                icon={isOpen ? <Close /> : <Sort />}
                className={classes.sorting}
                onClick={() => setIsOpen(!isOpen)}
                data-testid="notifications-sorting-button"
            />
            <Popup hasPopupPadding={false} isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <div className={classes.optionsList}>
                    <button
                        data-testid="notifications-sorting-asc"
                        className={classNames(classes.option, { [classes.selected]: selected === 'asc' })}
                        onClick={() => handleSortingChange('asc')}
                    >
                        <p>{t('orders.live_orders_notifications.main.filter_oldest')}</p>
                    </button>
                    <button
                        data-testid="notifications-sorting-desc"
                        className={classNames(classes.option, { [classes.selected]: selected === 'desc' })}
                        onClick={() => handleSortingChange('desc')}
                    >
                        <p>{t('orders.live_orders_notifications.main.filter_newest')}</p>
                    </button>
                </div>
            </Popup>
        </div>
    );
};

export default NotificationsSorting;
