import React, { PropsWithChildren, useEffect } from 'react';
import { IconButton, SideSheet } from '@jet-pie/react';
import { Close } from '@jet-pie/react/esm/icons';
import { Navigate, Outlet, RouteProps, useLocation } from 'react-router';
import { FeatureManagerProvider } from '@lo/shared/contexts/FeatureManagerContext';
import { useOpenedOrderId } from '@lo/shared/store/orders';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import { useOverflowElement } from '@lo/web/hooks/useOverflowElement';
import useNotifications from '@lo/shared/hooks/useNotifications';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import useWatchForNewOrders from '@lo/shared/hooks/useWatchForNewOrders';
import Banners from '@lo/web/components/Banners/Banners';
import Footer from '@lo/web/components/Footer/Footer';
import Header from '@lo/web/components/Header/Header';
import PinPopup from '@lo/web/components/PinPopup/PinPopup';
import Navigation from '@lo/web/components/Navigation/Navigation';
import RestaurantSidebar from '@lo/web/components/RestaurantSidebar/RestaurantSidebar';
import NotificationsSidebar from '@lo/web/components/NotificationsSidebar/NotificationsSidebar';
import useGetFeedbackPopup from './hooks/useGetFeedbackPopup';
import tkwyLogo from '../../static/images/icon-72.png';
import classes from './DefaultLayout.module.scss';
import HolidaySurvey from '@lo/web/components/HolidaySurvey/HolidaySurvey';
import useHolidaySurvey from '@lo/shared/hooks/useHolidaySurvey';
import { useAlcoholNotification } from '@lo/shared/hooks/useAlcoholNotification';
import { justEatHiddenRoutes } from '../../routes/routes';
import useTrainingControl from '@lo/shared/hooks/useTrainingControl';
import Training from '@lo/web/components/Training/Training';
import { useIsTrainingActive } from '@lo/shared/store/trainings';
import useTitleForMultipleAccount from './hooks/useTitleForMultipleAccount';
import NavigationSidebar from '@lo/web/components/NavigatonSidebar/NavigationSidebar';

const DefaultLayout: React.FC<PropsWithChildren<RouteProps>> = () => {
    const openedOrderId = useOpenedOrderId();
    const { isLessThanDesktopWidth, isLessThanTabletWidth, isTablet } = useWindowSize();
    const restaurant = useRestaurant();
    useNotifications();
    const location = useLocation();
    const isTrainingActive = useIsTrainingActive();

    useGetFeedbackPopup();
    useTitleForMultipleAccount();
    useWatchForNewOrders();
    useAlcoholNotification();

    const { data: holidaySurvey, loadNextSurvey } = useHolidaySurvey();

    const [menuSideBarIsOpen, toggleMenuSidebar] = useOverflowElement();
    const [notificationsSidebarIsOpen, toggleNotificationsSidebar] = useOverflowElement();
    const [restaurantSidebarIsOpen, toggleRestaurantSidebar] = useOverflowElement();
    const [externalLinksMenuIsOpen, toggleExternalLinksMenu] = useOverflowElement();

    useTrainingControl('notifications', { open: toggleNotificationsSidebar });

    useEffect(() => {
        toggleMenuSidebar(false);
    }, [location]);

    if (restaurant.is_just_eat && !isTrainingActive && justEatHiddenRoutes.includes(location.pathname)) {
        return <Navigate replace to="/orders" />;
    }

    return (
        <FeatureManagerProvider>
            <>
                <>
                    {!isTablet && (
                        <Header
                            openMenuSidebar={() => toggleMenuSidebar(true)}
                            openNotificationsSidebar={() => toggleNotificationsSidebar(true)}
                            openRestaurantSidebar={() => toggleRestaurantSidebar(true)}
                            toggleExternalLinkMenu={toggleExternalLinksMenu}
                            externalLinksMenuIsOpen={externalLinksMenuIsOpen}
                        />
                    )}

                    <Banners />

                    {isLessThanDesktopWidth && (
                        <SideSheet
                            id="navigationSideSheet"
                            isOpen={menuSideBarIsOpen}
                            onShowSideSheet={() => toggleMenuSidebar(!menuSideBarIsOpen)}
                            orientation="left"
                            width={isLessThanTabletWidth ? '100%' : '342px'}
                            hideOnOutsideClick
                            hideHeader
                            backdrop
                        >
                            <div className={classes.navigationHeader}>
                                <div className={classes.navigationHeaderLogoTitle}>
                                    <img src={tkwyLogo} width={28} style={{ display: 'block' }} />
                                    <div className={classes.navigationHeaderTitle}>Live Orders</div>
                                </div>
                                <IconButton
                                    onClick={() => toggleMenuSidebar(!menuSideBarIsOpen)}
                                    data-testid="close-menu-sidebar"
                                    icon={<Close />}
                                    variant="ghost-tertiary"
                                    size="x-small"
                                />
                            </div>
                            <Navigation
                                toggleExternalLinkMenu={toggleExternalLinksMenu}
                                externalLinksMenuIsOpen={externalLinksMenuIsOpen}
                            />
                        </SideSheet>
                    )}

                    <NotificationsSidebar
                        isOpen={notificationsSidebarIsOpen}
                        toggleSidebar={() => toggleNotificationsSidebar(!notificationsSidebarIsOpen)}
                    />
                    <RestaurantSidebar
                        isOpen={restaurantSidebarIsOpen}
                        toggleSidebar={toggleRestaurantSidebar}
                        restaurant={restaurant}
                    />
                </>

                <div className={classes.navWrapper}>
                    {!isLessThanTabletWidth && (
                        <NavigationSidebar
                            openMenuSidebar={() => toggleMenuSidebar(true)}
                            openNotificationsSidebar={() => toggleNotificationsSidebar(true)}
                            openRestaurantSidebar={() => toggleRestaurantSidebar(true)}
                        />
                    )}

                    <div className={classes.container}>
                        <Outlet />
                    </div>
                </div>

                {!openedOrderId && <Footer restaurant={restaurant} />}
            </>
            <PinPopup />
            {holidaySurvey && <HolidaySurvey holidaySurvey={holidaySurvey} loadNextSurvey={loadNextSurvey} />}
            {!holidaySurvey && <Training />}
        </FeatureManagerProvider>
    );
};

export default DefaultLayout;
