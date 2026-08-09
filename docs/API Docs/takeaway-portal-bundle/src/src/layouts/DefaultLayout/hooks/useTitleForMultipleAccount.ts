import useChainRestaurants from '@lo/shared/hooks/useChainRestaurants';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { useEffect } from 'react';

const useTitleForMultipleAccount = () => {
    const selectedRestaurant = useRestaurant();
    const restaurants = useChainRestaurants();
    const hasMultipleRestaurants = restaurants.data && restaurants.data.length > 1;

    useEffect(() => {
        if (!hasMultipleRestaurants) return;

        document.title = `${selectedRestaurant.name} | ${document.title}`;
    }, [hasMultipleRestaurants, selectedRestaurant.name]);
};

export default useTitleForMultipleAccount;
