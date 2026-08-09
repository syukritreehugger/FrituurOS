import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { RoutesList } from './routes/routes';
import CookieBanner from '@lo/web/components/CookieBanner/CookieBanner';
import { handleOrderRequest, handleLanguageParameter } from './common/js/urlRequest';
import useAppState from '@lo/web/hooks/useAppState';
import BusyModeOnboarding from '@lo/web/components/Onboarding/BusyModeOnboarding';
import { useIsAuthenticated } from '@lo/shared/store/auth';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import { useToasterBottomOffset } from '@lo/shared/store/toaster';
import 'react-toastify/dist/ReactToastify.css';
import './index.scss';

const App: React.FC = () => {
    const location = useLocation();
    const isAuthenticated = useIsAuthenticated();
    const { isLessThanTabletWidth } = useWindowSize();
    const toasterBottomOffset = useToasterBottomOffset();
    useAppState();

    useEffect(() => {
        handleOrderRequest(location);
        handleLanguageParameter(location);
    }, []);

    return (
        <>
            <ToastContainer style={{ bottom: isLessThanTabletWidth ? toasterBottomOffset : 0 }} />
            <RoutesList />
            <CookieBanner />
            {isAuthenticated && <BusyModeOnboarding />}
        </>
    );
};

export default App;
