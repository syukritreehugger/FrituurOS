import { DefaultError, useMutation, useQueryClient } from '@tanstack/react-query';
import { takeItemsOffline, takeItemsOnline } from '../api/oneMenu';
import { OfflineItemsData, OneMenuOfflineItem, OnlineItemsData } from '../types/oneMenuType';
import useRestaurant from './useRestaurant';
import { showInfoToast } from '../services/toaster';
import i18n from '../localization/i18n';

const showProductUpdateToast = (status: 'online' | 'offline', product?: string) => {
    if (!product) return showInfoToast(i18n.t('orders.live_orders_menu.main.all_items_in_stock'));
    showInfoToast(
        i18n.t(`orders.live_orders_menu.main.${status === 'online' ? 'in_stock_toaster' : 'out_of_stock_toaster'}`, {
            product
        })
    );
};

export const useOneMenuUpdateProducts = () => {
    const queryClient = useQueryClient();
    const restaurant = useRestaurant();

    const offlineMutation = useMutation<any, DefaultError, OfflineItemsData>({
        mutationFn: (data) => takeItemsOffline(data),
        onSuccess: (_, variables) => {
            queryClient.setQueryData<OneMenuOfflineItem[]>(['oneMenuOfflineItems', restaurant.id], (items) => [
                ...(items || []),
                { id: variables.variationIds[0], nextAvailableAt: null }
            ]);

            showProductUpdateToast('offline', variables.productName);
        }
    });

    const onlineMutation = useMutation<any, DefaultError, OnlineItemsData>({
        mutationFn: (data) => takeItemsOnline(data),
        onSuccess: (_, variables) => {
            queryClient.setQueryData<OneMenuOfflineItem[]>(['oneMenuOfflineItems', restaurant.id], (items) =>
                [...(items || [])].filter((item) => !variables.variationIds.includes(item.id))
            );
            showProductUpdateToast('online', variables.productName);
        }
    });

    return {
        isPending: offlineMutation.isPending || onlineMutation.isPending,
        isSuccess: offlineMutation.isSuccess && onlineMutation.isSuccess,
        putProductOffline: offlineMutation.mutate,
        putProductOnline: onlineMutation.mutate
    };
};
