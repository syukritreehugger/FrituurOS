import { Product } from '../../types/orderDataType';

export default (products: Product[]): { [k: string]: Product[] } => {
    return products.reduce(
        (acc, product) => {
            if (acc.hasOwnProperty(product.category_name)) {
                acc[product.category_name].push(product);
            } else {
                acc[product.category_name] = [product];
            }

            return acc;
        },
        {} as Record<string, Product[]>
    );
};
