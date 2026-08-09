import { useOneMenu } from '@lo/shared/hooks/useOneMenu';
import { useOneMenuUpdateProducts } from '@lo/shared/hooks/useOneMenuUpdateProducts';
import { useOutOfStockFilterActions, useOutOfStockFilterIsActive } from '../store/menuOutOfStockFilter';
import { useSearchFilterActions } from '../store/menuSearchFilter';

type UseUpdateProductReturnType = {
    takeOffline: (productName: string, productId: string, backToStockAt?: Date) => void;
    takeOnline: (productName: string, productId: string) => void;
    takeAllOnline: (productIds: string[]) => void;
    isPending: boolean;
    isSuccess: boolean;
};

export const useUpdateProduct = (): UseUpdateProductReturnType => {
    const oneMenu = useOneMenu();
    const oneMenuProductsMutations = useOneMenuUpdateProducts();
    const isOutOfStockFilterActive = useOutOfStockFilterIsActive();
    const { toggle } = useOutOfStockFilterActions();
    const { clear } = useSearchFilterActions();

    const takeOffline = (productName: string, productId: string, backToStockAt?: Date) => {
        oneMenuProductsMutations.putProductOffline({
            productName,
            variationIds: [productId],
            modifierIds: [],
            nextAvailableAt: backToStockAt?.toISOString() || null
        });
    };

    const takeOnline = (productName: string, productId: string) => {
        oneMenuProductsMutations.putProductOnline({
            productName,
            variationIds: [productId],
            modifierIds: []
        });
    };

    const takeAllOnline = (productIds: string[]) => {
        const variationIds = (oneMenu.data?.categories || [])
            .flatMap((category) => category.items.flatMap((item) => item.variations))
            .filter((item) => productIds.includes(item.id.toString()))
            .map((item) => item.id.toString());

        oneMenuProductsMutations.putProductOnline({ variationIds, modifierIds: [] });

        if (isOutOfStockFilterActive) {
            clear();
            toggle();
        }
    };

    return {
        takeOffline,
        takeOnline,
        takeAllOnline,
        isPending: oneMenuProductsMutations.isPending,
        isSuccess: oneMenuProductsMutations.isSuccess
    };
};
