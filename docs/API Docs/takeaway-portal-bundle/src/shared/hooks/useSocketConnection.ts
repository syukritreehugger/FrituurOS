import { useEffect } from 'react';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { connect, disconnect } from '@lo/shared/services/sockets';
import { useIsAuthenticated } from '@lo/shared/store/auth';

const useSocketConnection = () => {
    const restaurant = useRestaurant();
    const isAuthenticated = useIsAuthenticated();

    useEffect(() => {
        if (isAuthenticated && restaurant) {
            connect(restaurant);
        }

        return disconnect;
    }, [restaurant.id, isAuthenticated]);
};

export default useSocketConnection;
