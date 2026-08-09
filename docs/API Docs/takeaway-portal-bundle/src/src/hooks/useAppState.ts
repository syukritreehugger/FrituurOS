import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { hideToast, showWarningToast } from '@lo/shared/services/toaster';
import { useBannersActions } from '@lo/shared/store/banners';
import { useAppStatusActions } from '@lo/shared/store/appStatus';

const useAppState = () => {
    const { t } = useTranslation();
    const { showBanner, hideBanner } = useBannersActions();
    const actions = useAppStatusActions();

    useEffect(() => {
        const onVisibilityChange = () => {
            actions.setIsActive(document.visibilityState !== 'hidden');
        };

        document.addEventListener('visibilitychange', onVisibilityChange, false);

        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, []);

    useEffect(() => {
        const handleOnline = () => {
            actions.setHasInternetConnection(true);

            hideToast('no-internet-connection');
            hideBanner('no-internet-connection');
        };

        const handleOffline = () => {
            actions.setHasInternetConnection(false);

            showWarningToast(t('orders.live_orders_messages.main.no_internet_connection'), {
                autoClose: false,
                closeable: false,
                toastId: 'no-internet-connection'
            });

            showBanner('no-internet-connection');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
};

export default useAppState;
