import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import useRestaurant from '@lo/shared/hooks/useRestaurant';

export default function useSetSentryContext() {
    const restaurant = useRestaurant();

    useEffect(() => {
        Sentry.setContext('restaurant', { ...restaurant });
    }, [restaurant.id]);
}
