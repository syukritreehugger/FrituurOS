import React, { FC, Suspense } from 'react';
import { Route, Routes, Navigate, useLocation, Outlet } from 'react-router';
import { Spinner } from '@jet-pie/react';
import safeLazy from '@lo/shared/helpers/safeLazy';
import useSocketConnection from '@lo/shared/hooks/useSocketConnection';
import useMQTTConnection from '@lo/shared/hooks/useMQTTConnection';
import DefaultLayout from '../layouts/DefaultLayout/DefaultLayout';
import StatementLayout from '../layouts/StatementLayout/StatementLayout';
import useFcm from '../hooks/useFcm';
import useRestaurantLanguage from '../hooks/useRestaurantLanguage';
import useSingleSignOn from '../hooks/useSingleSignOn';
import useTrackPageView from '../hooks/useTrackPageView';
import useSetSentryContext from '../hooks/useSetSentryContext';

const TConnect = safeLazy(() => import('../pages/TConnect/TConnect'));
const NotFound = safeLazy(() => import('../pages/NotFound/NotFound'));
const Receipt = safeLazy(() => import('../pages/Receipt/Receipt'));
const CookieStatement = safeLazy(() => import('../pages/CookieStatement/CookieStatement'));
const TechnologiesList = safeLazy(() => import('../pages/TechnologiesList/TechnologiesList'));
const Orders = safeLazy(() => import('../pages/Orders/Orders'));
const Settings = safeLazy(() => import('../pages/Settings/Settings'));
const Menu = safeLazy(() => import('../pages/Menu/Menu'));
const OrderHistory = safeLazy(() => import('../pages/OrderHistory/OrderHistory'));

const Loader: FC = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner variant="brand" size="XL" />
    </div>
);

const Authenticated: FC = () => {
    useFcm();
    useSocketConnection();
    useMQTTConnection();
    useRestaurantLanguage();
    useTrackPageView();
    useSetSentryContext();

    return <Outlet />;
};

const RequireAuth: FC = () => {
    const { isAuthenticated } = useSingleSignOn();

    return isAuthenticated ? <Authenticated /> : <Loader />;
};

export const justEatHiddenRoutes = ['/menu'];

export const RoutesList: React.FC = () => {
    const location = useLocation();

    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                <Route path="/" element={<Navigate replace to={`/orders${location.search}`} />} />

                <Route
                    path="/cookie-statement"
                    element={
                        <StatementLayout>
                            <CookieStatement />
                        </StatementLayout>
                    }
                />
                <Route
                    path="/technologies-list"
                    element={
                        <StatementLayout>
                            <TechnologiesList />
                        </StatementLayout>
                    }
                />

                <Route path="/tconnect" element={<TConnect />} />

                <Route element={<RequireAuth />}>
                    <Route element={<DefaultLayout />}>
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/history" element={<OrderHistory />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/menu" element={<Menu />} />
                    </Route>

                    <Route path="/orders/:id/receipt" element={<Receipt />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};
