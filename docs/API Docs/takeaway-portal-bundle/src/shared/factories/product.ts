import { Product, Specification } from '../types/orderDataType';

export const makeSpecification = (fields: Partial<Specification> = {}): Specification => {
    return {
        id: 1,
        name: 'Specification Name',
        amount: 1,
        code: 'spec-1',
        ...fields
    };
};

export const makeProduct = (fields: Partial<Product> = {}): Product => {
    return {
        id: 1,
        name: 'Chicken',
        category_name: 'BBQ',
        code: '123',
        remarks: 'test remark',
        quantity: 1,
        amount: 7,
        total_amount: 14,
        specifications: [],
        menu_product_id: 'menu-1',
        partner_product_ids: [],
        is_available: true,
        ...fields
    };
};
