import { useMemo } from 'react';
import { Menu, MenuCategory, MenuProduct } from '@lo/shared/types/menuType';
import { OneMenu } from '@lo/shared/types/oneMenuType';
import { useOneMenuOfflineItems } from '@lo/shared/hooks/useOneMenuOfflineItems';

type OneMenuMapped = {
    data: Menu;
};

export const useOneMenuMapper = (oneMenu?: OneMenu): OneMenuMapped => {
    const { data: offlineItems } = useOneMenuOfflineItems();
    const offlineItemsIds = offlineItems?.flatMap((item) => item.id) || [];

    const oneMenuCategories = useMemo(() => {
        return oneMenu?.categories.map((oneMenuCategory) => {
            const products: MenuProduct[] = [];
            oneMenuCategory.items.forEach((oneMenuItem) => {
                products.push(
                    ...oneMenuItem.variations.map((variation) => ({
                        category_id: oneMenuCategory.id,
                        id: variation.id,
                        name: `${oneMenuItem.name}${variation.name ? ' ' + variation.name : ''}`,
                        code: variation.externalId,
                        gtin: variation.gtin || undefined,
                        sold_out: offlineItemsIds.includes(variation.id.toString()),
                        sort_id: 0,
                        shipping_method: '',
                        back_to_stock_at: null,
                        type: 'variation' as MenuProduct['type']
                    }))
                );
            });

            const newCategory: MenuCategory = {
                id: oneMenuCategory.id,
                name: oneMenuCategory.name,
                products
            };
            return newCategory;
        });
    }, [oneMenu, offlineItemsIds]);

    return {
        data: {
            categories: oneMenuCategories || [],
            updated_at: ''
        }
    };
};
