import { useQuery } from '@tanstack/react-query';
import useRestaurant from './useRestaurant';
import usePinProtection from './usePinProtection';
import { OneMenuOfflineItem } from '../types/oneMenuType';
import { getOfflineItems } from '../api/oneMenu';

export const useOneMenuOfflineItems = () => {
    const restaurant = useRestaurant();
    const { pinIsChecked } = usePinProtection();

    return useQuery<OneMenuOfflineItem[]>({
        queryKey: ['oneMenuOfflineItems', restaurant.id],
        queryFn: getOfflineItems,
        enabled: pinIsChecked,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        refetchOnMount: false
    });
};
