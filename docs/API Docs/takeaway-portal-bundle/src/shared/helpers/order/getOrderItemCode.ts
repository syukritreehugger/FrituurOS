import { Product, Specification } from '../../types/orderDataType';
import { MenuProduct } from '../../types/menuType';

export const getOrderItemCode = function (
    item: Product | Specification | MenuProduct,
    idLength?: number | null
): string | null | undefined {
    const code = item.gtin ? item.gtin : item.code;
    return idLength ? code?.slice(0, idLength) : code;
};
