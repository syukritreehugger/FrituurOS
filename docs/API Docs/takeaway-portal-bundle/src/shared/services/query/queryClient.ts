import { DefaultError, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { AxiosError, CanceledError } from 'axios';
import { showErrorToast } from '../toaster';
import i18n from '../../localization/i18n';
import { logout } from '@lo/shared/services/auth';
import { resetPinCode } from '../pin';
import { reloadPage } from '../../helpers/reloadPage';

declare module '@tanstack/react-query' {
    interface Register {
        defaultError: AxiosError<{ reason?: string; message?: string }> | CanceledError<''>;
    }
}

type ErrorReporter = (error: unknown) => void;

let captureException: ErrorReporter = () => {}; // no-op by default

export function setErrorReporter(reporter: ErrorReporter): void {
    captureException = reporter;
}

function handleError(error: DefaultError): void {
    if (error instanceof CanceledError) {
        return;
    }

    const message = error.response?.data?.message;

    switch (error.response?.status) {
        case 500:
            showErrorToast(message ?? i18n.t('orders.live_orders_messages.main.server_error'));
            return;
        case 422:
            showErrorToast(message ?? i18n.t('orders.live_orders_messages.main.error'));
            return;
        case 404:
            showErrorToast(message ?? i18n.t('orders.live_orders_messages.main.not_found'));
            return;
        case 403:
            if (error.response.data.reason === 'pin_required') {
                // Could miss restaurant update with new settings
                queryClient.invalidateQueries({ queryKey: ['restaurant'] });
                resetPinCode();
                return;
            }

            if (error.response?.data?.message === 'Wrong status transition!') {
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                captureException('Order status transition failed.');
                return;
            }

            showErrorToast(message ?? i18n.t('orders.live_orders_messages.main.forbidden'));
            return;
        default:
            console.error(`Request to ${error.response?.config.url} failed with status ${error.response?.status}`);
    }
}

function handleRestaurantQueryError(error: DefaultError): void {
    if (error instanceof CanceledError) {
        return;
    }

    const status = error.response?.status;

    if (status === 401 || status === 403) {
        const message = error.response?.data?.message;
        showErrorToast(i18n.t('orders.live_orders_messages.main.unauthorized'));
        logout(`Error ${status} - ${message}`);
        return;
    }

    showErrorToast(i18n.t('orders.live_orders_messages.main.please_try_later'), {
        autoClose: false,
        closeable: false,
        ctaButtonText: i18n.t('orders.live_orders_messages.main.reload_page'),
        onCtaButtonClick: reloadPage,
        toastId: 'connection-error'
    });
}

function shouldRetryQuery(failureCount: number, error: DefaultError): boolean {
    const status = error.response?.status;
    const message = error.response?.data && error.response.data.message;

    // A known issue with the server. Can be removed when fixed.
    if (message?.includes('Error while reading line from the server')) {
        return true;
    }

    if (error instanceof CanceledError) {
        return false;
    }

    return status !== 403 && failureCount < 2;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: shouldRetryQuery
        }
    },
    mutationCache: new MutationCache({ onError: handleError }),
    queryCache: new QueryCache({
        onError: (error, query) => {
            if (query.queryKey[0] === 'restaurant') {
                handleRestaurantQueryError(error);
            } else {
                handleError(error);
            }
        }
    })
});

export default queryClient;
