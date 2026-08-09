import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import axios, { AxiosError } from 'axios';
import * as Sentry from '@sentry/react';
import { PIEThemeProvider } from '@jet-pie/react';
import { skipTokens } from '@jet-pie/theme/variations/skip';
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18nCustom from '@lo/shared/localization/i18n';
import queryClient, { setErrorReporter } from '@lo/shared/services/query/queryClient';
import config from '@lo/shared/services/config';
import { registerShowNotificationToast } from '@lo/shared/services/toaster';
import { toast, Zoom } from 'react-toastify';
import NotificationToast from './components/UI/NotificationToast/NotificationToast';
import 'core-js-pure/features/object/values';

function shouldIgnoreSentryError(originalException?: AxiosError | any): boolean {
    const stack = originalException?.stack || '';
    const message = originalException?.message || '';

    if (stack.includes('extension') || message.includes('extension')) {
        return true;
    }

    if (!originalException || !originalException.isAxiosError) {
        return false;
    }

    if (
        originalException.config &&
        originalException.config.url &&
        originalException.config.url.includes('https://features.api.justeattakeaway.com')
    ) {
        return true;
    }

    if (axios.isCancel(originalException)) {
        return true;
    }

    return false;
}

function enhanceEventWithAxiosData(event: Sentry.ErrorEvent, originalException?: AxiosError): Sentry.ErrorEvent {
    if (!originalException || !originalException.isAxiosError) {
        return event;
    }

    return {
        ...event,
        extra: {
            ...event.extra,
            axiosRequest: {
                url: originalException.config?.url,
                method: originalException.config?.method,
                params: originalException.config?.params,
                data: originalException.config?.data
            },
            axiosResponse: {
                status: originalException.response?.status,
                statusText: originalException.response?.statusText,
                data: originalException.response?.data
            }
        }
    };
}

Sentry.init({
    dsn: 'https://111a5920c1b709a7a58f73af824091f0@o408587.ingest.sentry.io/4506220113100800',
    environment: config.env,
    release: `live-orders-${config.release ?? 'unknown'}`,
    enabled: config.env !== 'development' && config.env !== 'ci',
    beforeSend(event, hint) {
        const originalException = hint.originalException as AxiosError | undefined;

        if (shouldIgnoreSentryError(originalException)) {
            return null;
        }

        return enhanceEventWithAxiosData(event, originalException);
    },
    beforeBreadcrumb(breadcrumb, hint) {
        if (breadcrumb.category === 'ui.click' && hint?.event?.target instanceof HTMLElement) {
            const target = hint.event.target;
            const testId = target.getAttribute('data-testid');

            if (testId) {
                breadcrumb.message = `${breadcrumb.message} [data-testid="${testId}"]`;
                breadcrumb.data = {
                    ...breadcrumb.data,
                    'data-testid': testId
                };
            }
        }

        return breadcrumb;
    }
});

setErrorReporter(Sentry.captureException.bind(Sentry));

registerShowNotificationToast((notification) => {
    const minTabletWidth = 768;
    const isMobile = window.innerWidth < minTabletWidth;

    toast(<NotificationToast notification={notification} />, {
        position: isMobile ? toast.POSITION.BOTTOM_CENTER : toast.POSITION.TOP_RIGHT,
        transition: Zoom,
        autoClose: false,
        style: { padding: 0 },
        hideProgressBar: true,
        draggable: false,
        closeButton: false,
        closeOnClick: true
    });
});

const app = document.getElementById('app') as Element;

const root = createRoot(app);

root.render(
    <Sentry.ErrorBoundary fallback={<div>An error has occurred</div>}>
        <BrowserRouter>
            <I18nextProvider i18n={i18nCustom}>
                <QueryClientProvider client={queryClient}>
                    <PIEThemeProvider customTheme={skipTokens} mode="light">
                        <App />
                    </PIEThemeProvider>
                </QueryClientProvider>
            </I18nextProvider>
        </BrowserRouter>
    </Sentry.ErrorBoundary>
);
