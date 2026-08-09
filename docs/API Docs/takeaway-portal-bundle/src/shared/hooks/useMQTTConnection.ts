import { useIsAuthenticated } from '../store/auth';
import useRestaurant from './useRestaurant';
import { useEffect } from 'react';
import { connect, disconnect } from '@lo/shared/services/aws';
import { getMQTTCredentials } from '../api/mqttCredentials';
import retryOnFailure from '../helpers/retryOnFailure';
import * as Sentry from '@sentry/browser';

const useMQTTConnection = () => {
    const restaurant = useRestaurant();
    const isAuthenticated = useIsAuthenticated();

    useEffect(() => {
        if (isAuthenticated && restaurant) {
            retryOnFailure(() =>
                getMQTTCredentials(restaurant.country_contact_information.code, restaurant.reference).then((mqttCredentials) => {
                    connect(restaurant, mqttCredentials);
                })
            ).catch(() => {
                Sentry.addBreadcrumb({ category: 'MQTT', message: 'call mqtt connect failed', data: { id: restaurant.id } });
            });
        }

        return disconnect;
    }, [isAuthenticated, restaurant.id]);
};

export default useMQTTConnection;
