import React, { useEffect, useRef } from 'react';
import classes from './NavigationSidebar.module.scss';
import { useWindowSize } from '../../hooks/useWindowSize';
import { useTranslation } from 'react-i18next';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { getMenuItems } from '@lo/shared/helpers/navigationRoute';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { PauseCircle } from '@jet-pie/react/esm/icons';
import { colors } from '../../common/js/colorTokens';
import Menu from '@jet-pie/react/esm/icons/Menu';
import { IconButton } from '@jet-pie/react';
import classNames from 'classnames';
import BellIcon from '../Icons/BellIcon';
import RestaurantLogo from '../RestaurantLogo/RestaurantLogo';
import NavigationRouteIcon from './NavigationRouteIcon/NavigationRouteIcon';
import { Transition } from 'react-transition-group';
import cn from 'classnames';
import { trainingElements } from '@lo/shared/types/trainings';
import useTrainingControl from '@lo/shared/hooks/useTrainingControl';
import { getNavigationTrainingId } from '@lo/shared/helpers/getNavigationTrainingId';
import useNotifications from '@lo/shared/hooks/useNotifications';

type NavigationSidebarProps = {
    openMenuSidebar: () => void;
    openNotificationsSidebar: () => void;
    openRestaurantSidebar: () => void;
};

const duration = 300;
const defaultStyle = {
    transition: `all ${duration}ms ease-out`,
    zIndex: -1
};
const transitionStyles = {
    exiting: { transform: 'translate(-100%, 0)', zIndex: -1 },
    exited: { transform: 'translate(-100%, 0)', zIndex: -1 }
};

const NavigationSidebar: React.FC<NavigationSidebarProps> = (props) => {
    const { openMenuSidebar, openRestaurantSidebar, openNotificationsSidebar } = props;

    const { isLessThanDesktopWidth, isLessThanTabletWidth } = useWindowSize();
    const { t } = useTranslation();
    const restaurant = useRestaurant();
    const navigate = useNavigate();
    const location = useLocation();
    const { amountOfUnread } = useNotifications();
    const isTablet = isLessThanDesktopWidth && !isLessThanTabletWidth;

    useTrainingControl('navigation', {
        open: () => openMenuSidebar(),
        openMenuPage: () => location.pathname !== '/menu' && navigate('/menu'),
        openOrderHistoryPage: () => location.pathname !== '/history' && navigate('/history'),
        openPauseRestaurant: () => navigate('/settings?openPauseModal=true'),
        closePauseRestaurant: () => navigate('/orders', { replace: true })
    });

    const [isHoveringMenu, setIsHoveringMenu] = React.useState(false);
    const [subNavigationChildren, setSubNavigationChildren] = React.useState<React.ReactNode>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const menuItems = getMenuItems(t, restaurant.is_just_eat);

    useEffect(() => {
        setIsHoveringMenu(false);
    }, [location]);

    return isTablet ? (
        <div className={classes.navigationSideBar} data-testid="navigation-container">
            <div className={classes.navigationContainer}>
                <div className={classes.navItem}>
                    <IconButton
                        data-testid="toggle-menu-icon"
                        onClick={openMenuSidebar}
                        size="x-small"
                        variant="ghost"
                        icon={<Menu />}
                    />
                </div>
                <div className={classes.navItem}>
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
            </div>
        </div>
    ) : (
        <div
            className={classes.navigationSideBar}
            data-testid="navigation-container"
            onMouseLeave={() => setIsHoveringMenu(false)}
        >
            <div className={classes.navigationContainer}>
                <div className={classes.navItem} data-training-id={trainingElements.navigation}>
                    {Object.entries(menuItems).map(([key, navigationSection]) => {
                        if (key === 'settings') return null;
                        return (
                            <NavLink
                                key={key}
                                to={navigationSection.items[0].route}
                                data-testid={`navigate-to${navigationSection.items[0].route.replace('/', '-')}`}
                            >
                                {({ isActive }) => (
                                    <div
                                        data-training-id={getNavigationTrainingId(key)}
                                        onMouseEnter={() => {
                                            setIsHoveringMenu(true);
                                            setSubNavigationChildren(
                                                <>
                                                    <div className={classes.subNavHeader}>{navigationSection.title}</div>
                                                    {navigationSection.items.map((item) => (
                                                        <NavLink key={item.name} to={item.route}>
                                                            <div
                                                                className={cn(
                                                                    isActive ? classes.subNavTextActive : classes.subNavText
                                                                )}
                                                            >
                                                                {item.name}
                                                            </div>
                                                        </NavLink>
                                                    ))}
                                                </>
                                            );
                                        }}
                                    >
                                        <div className={classes.navIcon}>
                                            <NavigationRouteIcon navRouteIcon={navigationSection.icon} isActive={isActive} />
                                        </div>
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                    <div className={classes.navIcon} data-training-id={trainingElements.pauseRestaurant}>
                        <PauseCircle
                            onClick={() => navigate('/settings?openPauseModal=true')}
                            width={28}
                            height={28}
                            fill={colors.alias.contentInteractiveSecondary}
                            className={classes.pauseOrdersShortCut}
                        />
                    </div>
                </div>
                <div className={classes.navItem}>
                    <NavLink
                        key={menuItems.settings.title}
                        to={menuItems.settings.items[0].route}
                        data-testid={`navigate-to${menuItems.settings.items[0].route.replace('/', '-')}`}
                    >
                        {({ isActive }) => (
                            <div
                                onMouseEnter={() => {
                                    setIsHoveringMenu(true);
                                    setSubNavigationChildren(
                                        <>
                                            <div className={classes.subNavHeader}>{menuItems.settings.title}</div>
                                            {menuItems.settings.items.map((item) => (
                                                <NavLink key={item.name} to={item.route}>
                                                    <div className={cn(isActive ? classes.subNavTextActive : classes.subNavText)}>
                                                        {item.name}
                                                    </div>
                                                </NavLink>
                                            ))}
                                        </>
                                    );
                                }}
                            >
                                <div className={classes.navIcon}>
                                    <NavigationRouteIcon navRouteIcon={menuItems.settings.icon} isActive={isActive} />
                                </div>
                            </div>
                        )}
                    </NavLink>
                </div>
            </div>
            <Transition in={isHoveringMenu} timeout={300} appear={true} nodeRef={containerRef}>
                {(state) => (
                    <div
                        style={{ ...defaultStyle, ...transitionStyles[state] }}
                        className={classes.subNavigation}
                        ref={containerRef}
                    >
                        <div>{subNavigationChildren}</div>
                    </div>
                )}
            </Transition>
        </div>
    );
};

export default NavigationSidebar;
