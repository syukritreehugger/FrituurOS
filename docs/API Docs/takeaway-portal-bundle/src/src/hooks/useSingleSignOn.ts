import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';
import { useAuthStoreActions, useIsAuthenticated } from '@lo/shared/store/auth';
import { login, loginByCode } from '@lo/shared/services/auth';
import { showErrorToast } from '@lo/shared/services/toaster';
import { reloadPage } from '@lo/shared/helpers/reloadPage';

export default () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthenticated = useIsAuthenticated();
    const { t } = useTranslation();
    const actions = useAuthStoreActions();

    const handleError = (error: any) => {
        showErrorToast(t('orders.live_orders_messages.main.please_try_later'), {
            autoClose: false,
            closeable: false,
            ctaButtonText: t('orders.live_orders_messages.main.reload_page'),
            onCtaButtonClick: reloadPage
        });

        Sentry.captureException('Login failed', { extra: { error } });
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const keycloakCode = params.get('code');
        const token = params.get('token') || localStorage.getItem('testToken');

        // For smoke tests only
        if (token) {
            navigate({ search: '' });
            localStorage.setItem('testToken', token);
            actions.loginSuccess(token);
            return;
        }

        if (isAuthenticated && !keycloakCode) {
            return;
        }

        if (keycloakCode) {
            navigate({ search: '' });
            loginByCode(keycloakCode).catch(handleError);
            return;
        }

        login().catch(handleError);
    }, [isAuthenticated]);

    return { isAuthenticated };
};
