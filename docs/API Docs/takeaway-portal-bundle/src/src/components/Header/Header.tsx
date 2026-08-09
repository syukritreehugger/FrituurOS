import React from 'react';
import { NavLink } from 'react-router';
import classNames from 'classnames';
import BellIcon from '../Icons/BellIcon';
import RestaurantLogo from '../RestaurantLogo/RestaurantLogo';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import classes from './Header.module.scss';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import BrandLogo from '../../static/images/icon.svg';
import { IconButton } from '@jet-pie/react';
import { MenuLarge } from '@jet-pie/react/esm/icons';
import ExternalLinkPopup from '../ExternalLinkPopup/ExternalLinkPopup';
import { trainingElements } from '@lo/shared/types/trainings';
import TrainingCenter from '../Training/TrainingCenter/TrainingCenter';
import useNotifications from '@lo/shared/hooks/useNotifications';

type HeaderProps = {
    openMenuSidebar: () => void;
    openNotificationsSidebar: () => void;
    openRestaurantSidebar: () => void;
    toggleExternalLinkMenu: () => void;
    externalLinksMenuIsOpen: boolean;
};

const TakeawayLogo: React.FC = () => (
    <NavLink to="/orders">
        <img src={BrandLogo} className={classes.brandLogo} />
    </NavLink>
);

const Header: React.FC<HeaderProps> = (props) => {
    const { openMenuSidebar, openRestaurantSidebar, openNotificationsSidebar, toggleExternalLinkMenu, externalLinksMenuIsOpen } =
        props;

    const restaurant = useRestaurant();
    const { isLessThanDesktopWidth } = useWindowSize();

    const showRestaurantPortalLink = restaurant && !restaurant.is_just_eat;
    const { amountOfUnread } = useNotifications();

    return (
        <header className={classes.container}>
            <div className={classes.leftPart}>
                {isLessThanDesktopWidth ? (
                    <IconButton
                        data-testid="toggle-menu-icon"
                        onClick={openMenuSidebar}
                        size="large"
                        variant="ghost"
                        icon={<MenuLarge />}
                    />
                ) : (
                    <div className={classes.brandName}>
                        <TakeawayLogo />
                        <div className={classes.brandNameText}>Live Orders</div>
                    </div>
                )}
            </div>

            <div className={classes.centralPart}>{isLessThanDesktopWidth && <TakeawayLogo />}</div>

            <div className={classes.rightPart}>
                {showRestaurantPortalLink && !isLessThanDesktopWidth && (
                    <ExternalLinkPopup
                        toggleExternalLinkMenu={toggleExternalLinkMenu}
                        externalLinksMenuIsOpen={externalLinksMenuIsOpen}
                    />
                )}

                <TrainingCenter isHeader />

                <button
                    onClick={openNotificationsSidebar}
                    className={classNames(classes.notificationsButton, { [classes.hasUnread]: amountOfUnread > 0 })}
                    data-testid="toggle-notifications-button"
                    data-training-id={trainingElements.notifications}
                >
                    <BellIcon fill={amountOfUnread > 0 ? '#FB6100' : '#8C999B'} />
                    {amountOfUnread > 0 && (
                        <span className={classes.badge} data-testid="notifications-count">
                            {amountOfUnread > 9 ? '9+' : amountOfUnread}
                        </span>
                    )}
                </button>

                <RestaurantLogo restaurant={restaurant} dataTestId="restaurant-logo" onClick={openRestaurantSidebar} />
            </div>
        </header>
    );
};

export default Header;
