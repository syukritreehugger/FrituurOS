import React, { useState } from 'react';
import { IconButton, Modal } from '@jet-pie/react';
import FiltersIcon from '@jet-pie/react/esm/icons/Filters';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import classes from './FiltersWrapper.module.scss';
import { useTranslation } from 'react-i18next';

type FiltersWrapperProps = {
    badgeCounter?: number;
    onConfirm?: () => void;
};

const FiltersWrapper: React.FC<React.PropsWithChildren<FiltersWrapperProps>> = (props) => {
    const { children, onConfirm, badgeCounter } = props;
    const { isLessThanDesktopWidth } = useWindowSize();
    const [filtersOpened, setFiltersOpened] = useState(false);
    const { t } = useTranslation();

    const handlePrimaryAction = () => {
        if (onConfirm) {
            onConfirm();
        }
        setFiltersOpened(false);
    };

    return (
        <div className={classes.filters} data-testid="menu-filters-container">
            {isLessThanDesktopWidth ? (
                <>
                    <div className={classes.filtersButton}>
                        <IconButton
                            data-testid="menu-filters-button"
                            icon={<FiltersIcon />}
                            variant="primary"
                            size="medium"
                            onClick={() => setFiltersOpened(true)}
                        />
                        {badgeCounter !== undefined && (
                            <div data-testid="menu-filters-counter" className={classes.badge}>
                                {badgeCounter}
                            </div>
                        )}
                    </div>
                    <Modal
                        data-testid="menu-filters-modal"
                        size="small"
                        variant="narrow"
                        isOpen={filtersOpened}
                        action="acknowledge"
                        title={{ text: t('orders.live_orders_menu.main.filters_title') ?? 'Filter items' }}
                        primaryAction={{
                            text: t('orders.live_orders_order_details.unavailable_items.confirm'),
                            onClick: handlePrimaryAction
                        }}
                        onClose={() => setFiltersOpened(false)}
                    >
                        {children}
                    </Modal>
                </>
            ) : (
                children
            )}
        </div>
    );
};

export default FiltersWrapper;
