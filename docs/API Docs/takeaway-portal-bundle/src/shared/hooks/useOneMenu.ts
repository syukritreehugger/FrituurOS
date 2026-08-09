import { useQuery } from '@tanstack/react-query';
import useRestaurant from './useRestaurant';
import usePinProtection from './usePinProtection';
import { OneMenu } from '../types/oneMenuType';
import { getOneMenu } from '../api/oneMenu';

export const useOneMenu = () => {
    const restaurant = useRestaurant();
    const { pinIsChecked } = usePinProtection();

    return useQuery<OneMenu>({
        queryKey: ['oneMenu', restaurant.id],
        queryFn: getOneMenu,
        enabled: pinIsChecked,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        refetchOnMount: false
    });
};
