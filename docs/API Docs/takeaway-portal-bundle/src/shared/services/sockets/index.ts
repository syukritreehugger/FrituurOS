import Echo from 'laravel-echo';
import io, { Socket } from 'socket.io-client';
import * as Sentry from '@sentry/browser';
import { getAccessToken, getTenant } from '@lo/shared/services/auth';
import getListenersMap from './getListenersMap';
import { hideToast, showErrorToast } from '../toaster';
import i18n from '../../localization/i18n';
import config from '../config';
import { reloadPage } from '../../helpers/reloadPage';
import getExtraHeaders from './getExtraHeaders';
import { RestaurantModel } from '../../models';
import { useAppStatusStore } from '../../store/appStatus';
import queryClient from '../query/queryClient';
import { useAuthStore } from '../../store/auth';
import { useOrdersStore } from '../../store/orders';

let instance: Echo<'socket.io'> | null = null;
let connectionFailures = 0;
let subscriptionFailures = 0;
let reconnectTimeout: NodeJS.Timeout | null = null;
let resetSubscriptionFailuresTimeout: NodeJS.Timeout | null = null;

const reconnectWithFreshToken = async () => {
    const token = await getAccessToken();

    if (!instance || !token) {
        handleError('No token available for reconnection.');
        return;
    }

    Sentry.addBreadcrumb({
        category: 'Socket',
        message: 'Reconnecting with fresh token'
    });

    useAppStatusStore.getState().actions.setIsReconnectingSockets(true);
    instance.options.auth.headers.Authorization = `Bearer ${token}`;
    instance.connector.socket.connect();
};

const handleError = (reason: string) => {
    showErrorToast(i18n.t('orders.live_orders_messages.main.please_try_later'), {
        autoClose: false,
        closeable: false,
        ctaButtonText: i18n.t('orders.live_orders_messages.main.reload_page'),
        onCtaButtonClick: reloadPage,
        toastId: 'connection-error',
        multiline: true
    });

    useAppStatusStore.getState().actions.setIsReconnectingSockets(false);
    Sentry.captureException('Socket connection failed after multiple attempts.', { extra: { reason } });
};

const listenToRestaurantEvents = (restaurant: RestaurantModel) => {
    /*
     * Leave all channels to avoid possible duplication of listeners.
     */
    instance?.leaveAllChannels();

    const listenersMap = getListenersMap(restaurant);

    for (const [channel, event, callback] of listenersMap) {
        instance?.listen(channel, event, (payload: any) => {
            callback(payload);

            Sentry.addBreadcrumb({
                category: 'Socket',
                message: event,
                data: payload
            });
        });
    }
};

const listenToConnectionEvents = (restaurant: RestaurantModel) => {
    const socket = instance?.connector.socket as Socket;

    socket.on('connect', () => {
        const isReconnecting = useAppStatusStore.getState().isReconnectingSockets;

        Sentry.addBreadcrumb({
            category: 'Socket',
            message: isReconnecting ? 'Reconnected to socket server' : 'Connected to socket server'
        });

        if (isReconnecting) {
            /**
             * Socket.io successfully reconnected.
             * Need to refresh all data that could be updated during the downtime.
             */
            queryClient.invalidateQueries();
        }

        listenToRestaurantEvents(restaurant);
        hideToast('connection-error');
        useAppStatusStore.getState().actions.setIsReconnectingSockets(false);
        connectionFailures = 0;
    });

    socket.on('connect_error', (error) => {
        connectionFailures++;

        Sentry.addBreadcrumb({
            category: 'Socket',
            message: 'Connection error',
            data: { connectionFailures, error }
        });

        if (connectionFailures === 5) {
            handleError('Multiple connection attempts failed.');
        } else {
            reconnectWithFreshToken();
        }
    });

    socket.on('subscription_error', () => {
        subscriptionFailures++;
        instance?.disconnect();

        Sentry.addBreadcrumb({
            category: 'Socket',
            message: 'Subscription error',
            data: { subscriptionFailures }
        });

        if (subscriptionFailures === 5) {
            handleError('Multiple subscription attempts failed.');
            return;
        }

        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
        }

        if (resetSubscriptionFailuresTimeout) {
            clearTimeout(resetSubscriptionFailuresTimeout);
        }

        reconnectTimeout = setTimeout(() => reconnectWithFreshToken(), 2000);

        resetSubscriptionFailuresTimeout = setTimeout(() => {
            subscriptionFailures = 0;
        }, 60000);
    });

    socket.on('disconnect', (reason) => {
        const { isActive, hasInternetConnection } = useAppStatusStore.getState();

        /*
         * We don't want to reconnect in such cases:
         * 1) the app is in the background (reconnection most likely won't be successful. We will reconnect when the app is active again.)
         * 2) there's no internet connection
         * 3) the disconnection was caused by the client (logout, etc.)
         */
        const disconnectedByClient = reason === 'io client disconnect';
        const shouldReconnect = isActive && hasInternetConnection && !disconnectedByClient;

        if (shouldReconnect) {
            const randomDelay = Math.random() * (10000 - 3000) + 3000; // Random delay between 3 and 10 seconds

            setTimeout(() => {
                reconnectWithFreshToken();
            }, randomDelay);
        }

        Sentry.addBreadcrumb({
            category: 'Socket',
            message: 'Disconnected',
            data: { reason, shouldReconnect, isActive, hasInternetConnection }
        });
    });
};

export const connect = async (restaurant: RestaurantModel) => {
    const token = await getAccessToken();
    const tenant = getTenant();

    const authHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        'X-Restaurant-Id': restaurant.reference
    };

    if (tenant !== 'default' && tenant !== 'internal') {
        authHeaders['X-Tenant'] = tenant;
    }

    if (!token) {
        handleError('No token available for connection.');
        return;
    }

    instance?.disconnect();

    instance = new Echo({
        broadcaster: 'socket.io',
        client: (typeof window !== 'undefined' && window.io) || io,
        host: config.socketHost,
        namespace: '',
        reconnection: false, // We handle reconnection manually
        auth: { headers: authHeaders },
        transports: ['websocket'],
        extraHeaders: await getExtraHeaders()
    });

    listenToConnectionEvents(restaurant);
};

export const disconnect = () => instance?.disconnect();

useAppStatusStore.subscribe((state, prevState) => {
    const { isAuthenticated } = useAuthStore.getState();

    const becameActive = state.isActive && !prevState.isActive;
    const regainedConnection = !prevState.hasInternetConnection && state.hasInternetConnection;
    const disconnected = instance?.connector.socket.disconnected;
    const shouldReconnect = isAuthenticated && disconnected && (becameActive || regainedConnection);

    if (shouldReconnect) {
        Sentry.addBreadcrumb({
            category: 'AppStatus',
            message: 'App became active. Attempting to reconnect sockets.'
        });

        useOrdersStore.getState().actions.closeOrderDetails();
        reconnectWithFreshToken();
    }
});
