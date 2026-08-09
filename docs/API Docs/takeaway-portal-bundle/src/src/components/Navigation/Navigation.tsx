import React, { Fragment } from 'react';
import classNames from 'classnames';
import classes from './Navigation.module.scss';
import { NavLink, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { getMenuItems } from '@lo/shared/helpers/navigationRoute';
import { CalendarLarge, HouseLarge, PauseCircle, RestaurantMenuLarge, SettingsLarge } from '@jet-pie/react/esm/icons';
import { colors } from '../../common/js/colorTokens';
import ExternalLinkPopup from '../ExternalLinkPopup/ExternalLinkPopup';
import { trainingElements } from '@lo/shared/types/trainings';
import { getNavigationTrainingId } from '@lo/shared/helpers/getNavigationTrainingId';

type NavigationProps = {
    toggleExternalLinkMenu: () => void;
    externalLinksMenuIsOpen: boolean;
};

const getIcon = (iconName: string, isActive: boolean) => {
    switch (iconName) {
        case 'House':
            return (
                <HouseLarge
                    width={28}
                    height={28}
                    fill={isActive ? colors.alias.contentInteractiveBrand : colors.alias.contentInteractiveSecondary}
                />
            );
        case 'RestaurantMenu':
            return (
                <RestaurantMenuLarge
                    width={28}
                    height={28}
                    fill={isActive ? colors.alias.contentInteractiveBrand : colors.alias.contentInteractiveSecondary}
                />
            );
        case 'Calendar':
            return (
                <CalendarLarge
                    width={28}
                    height={28}
                    fill={isActive ? colors.alias.contentInteractiveBrand : colors.alias.contentInteractiveSecondary}
                />
            );
        case 'Settings':
            return (
                <SettingsLarge
                    width={28}
                    height={28}
                    fill={isActive ? colors.alias.contentInteractiveBrand : colors.alias.contentInteractiveSecondary}
                />
            );
        default:
            return null;
    }
};

const Navigation: React.FC<NavigationProps> = ({ toggleExternalLinkMenu, externalLinksMenuIsOpen }) => {
    const { isLessThanDesktopWidth } = useWindowSize();
    const { t } = useTranslation();
    const restaurant = useRestaurant();
    const navigate = useNavigate();

    const menuItems = getMenuItems(t, restaurant.is_just_eat);

    return (
        <div
            data-testid="navigation-container"
            data-training-id={trainingElements.navigation}
            className={classNames(classes.container, {
                [classes.desktop]: !isLessThanDesktopWidth
            })}
        >
            <ExternalLinkPopup
                toggleExternalLinkMenu={toggleExternalLinkMenu}
                externalLinksMenuIsOpen={externalLinksMenuIsOpen}
            />
            {Object.entries(menuItems).map(([key, navigationSection]) => {
                return (
                    <Fragment key={key}>
                        {navigationSection.items.map((item) => (
                            <NavLink key={item.route} to={item.route} data-testid={`navigate-to${item.route.replace('/', '-')}`}>
                                {({ isActive }) => (
                                    <div className={classes.linkItem} data-training-id={getNavigationTrainingId(key)}>
                                        {getIcon(navigationSection.icon, isActive)}
                                        <div className={isActive ? classes.linkTextActive : classes.linkText}>{t(item.name)}</div>
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </Fragment>
                );
            })}
            {isLessThanDesktopWidth && (
                <div
                    className={classes.linkItem}
                    data-training-id={trainingElements.pauseRestaurant}
                    onClick={() => navigate('/settings?openPauseModal=true')}
                >
                    <PauseCircle width={28} height={28} fill={colors.alias.contentInteractiveSecondary} />
                    <div className={classes.linkText}>{t('orders.live_orders_navigation.menu.pause_new_orders')}</div>
                </div>
            )}
        </div>
    );
};

export default Navigation;
