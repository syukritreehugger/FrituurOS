import React from 'react';
import classes from './ExternalLinkPopup.module.scss';
import { BottomSheet, Button, useOnClickOutside } from '@jet-pie/react';
import { Atom, Basket, Moped, Order, Restaurant, SwitchProduct } from '@jet-pie/react/esm/icons';
import { externalLinksList } from '@lo/shared/helpers/externalLinksList';
import cn from 'classnames';
import { colors } from '../../common/js/colorTokens';
import { useWindowSize } from '../../hooks/useWindowSize';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import useBrandInMarket from './useBrandInMarket';
import { useTranslation } from 'react-i18next';

type ExternalLinkPopupProps = {
    toggleExternalLinkMenu: (value: boolean) => void;
    externalLinksMenuIsOpen: boolean;
};

const getIcon = (iconName: string) => {
    switch (iconName) {
        case 'Restaurant':
            return <Restaurant width={21} height={21} fill={colors.alias.contentInteractiveSecondary} />;
        case 'Order':
            return <Order width={21} height={21} fill={colors.alias.contentInteractiveBrand} />;
        case 'Moped':
            return <Moped width={21} height={21} fill={colors.alias.contentInteractiveSecondary} />;
        case 'Basket':
            return <Basket width={21} height={21} fill={colors.alias.contentInteractiveSecondary} />;
        case 'Atom':
            return <Atom width={21} height={21} fill={colors.alias.contentInteractiveSecondary} />;
        default:
            return null;
    }
};

const ExternalLinkPopup: React.FC<ExternalLinkPopupProps> = ({ toggleExternalLinkMenu, externalLinksMenuIsOpen }) => {
    const { isLessThanDesktopWidth, isLessThanTabletWidth } = useWindowSize();
    const restaurant = useRestaurant();
    const externalLinksListArray = externalLinksList(restaurant.tenant);
    const jetBrand = useBrandInMarket();
    const { t } = useTranslation();

    const { containerRef } = useOnClickOutside(() => {
        toggleExternalLinkMenu(false);
    });

    const handleExternalLinkClick = (link) => {
        window.open(link);
    };

    return !isLessThanDesktopWidth ? (
        <div className={classes.externalLinkWrapper} ref={containerRef}>
            <Button
                variant="outline"
                size="small-expressive"
                icon={<SwitchProduct />}
                onClick={() => toggleExternalLinkMenu(!externalLinksMenuIsOpen)}
                data-testid="external-links-button"
            >
                <div className={classes.externalLinkTitle}>
                    {t('orders.live_orders_navigation.menu.more_from')} {jetBrand}
                </div>
            </Button>
            {externalLinksMenuIsOpen && (
                <div className={classes.popupWrapper}>
                    {externalLinksListArray.map((link, index) => (
                        <button
                            className={classes.externalLinkButton}
                            key={link.name}
                            onClick={(e) => {
                                e.preventDefault();
                                handleExternalLinkClick(link.url);
                            }}
                            data-testid={`external-link-button-desktop-${link.name}`}
                        >
                            <div className={cn(classes.bottomPadding, classes.externalLinkIcon)}>{getIcon(link.icon)}</div>
                            <div
                                className={cn(
                                    index !== externalLinksListArray.length - 1 && classes.bottomBorder,
                                    index === externalLinksListArray.length - 1 && classes.bottomPadding,
                                    link.name === 'Live Orders' ? classes.textActive : classes.text
                                )}
                            >
                                {link.name}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    ) : (
        <>
            <div className={classes.mobileWrapper}>
                <button
                    className={classes.mobileButton}
                    onClick={() => toggleExternalLinkMenu(!externalLinksMenuIsOpen)}
                    data-testid="external-links-button"
                >
                    <SwitchProduct width={21} height={21} fill={colors.alias.supportBrand06} />
                    <div className={classes.mobileTextContainer}>
                        <div className={classes.mobileMainText}>
                            {t('orders.live_orders_navigation.menu.more_from')} {jetBrand}
                        </div>
                        <div className={classes.mobileSubText}>
                            {t('orders.live_orders_navigation.menu.go_to')} {externalLinksListArray[0].name}
                        </div>
                    </div>
                </button>
            </div>
            <BottomSheet
                isOpened={externalLinksMenuIsOpen}
                onClose={() => toggleExternalLinkMenu(!externalLinksMenuIsOpen)}
                position="left"
                hasBodyPadding={false}
                width={isLessThanTabletWidth ? '100%' : '342px'}
                headerTitle="Go to:"
                headerContentModifiers="default"
                shouldCloseOnOverlayClick={true}
            >
                {externalLinksListArray.map((link, index) => (
                    <button
                        key={link.name}
                        className={classes.externalLinkButton}
                        onClick={(e) => {
                            e.preventDefault();
                            handleExternalLinkClick(link.url);
                        }}
                        data-testid={`external-link-button-${link.name}`}
                    >
                        <div className={cn(classes.bottomPadding, classes.externalLinkIcon)}>{getIcon(link.icon)}</div>
                        <div
                            className={cn(
                                index !== externalLinksListArray.length - 1 && classes.bottomBorder,
                                index === externalLinksListArray.length - 1 && classes.bottomPadding,
                                link.name === 'Live Orders' ? classes.textActive : classes.text
                            )}
                        >
                            {link.name}
                        </div>
                    </button>
                ))}
                <div className={classes.mobileMarginBottom} />
            </BottomSheet>
        </>
    );
};

export default ExternalLinkPopup;
