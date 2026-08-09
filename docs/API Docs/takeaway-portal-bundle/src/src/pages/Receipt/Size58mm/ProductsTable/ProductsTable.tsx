import React, { FC, Fragment } from 'react';
import { Product } from '@lo/shared/types/orderDataType';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { formatTotal, getItemCode } from '@lo/shared/helpers/receipt';
import classes from './ProductsTable.module.scss';

type ProductsTableProps = {
    products: Product[];
    currency: string;
};

const ProductsTable: FC<ProductsTableProps> = (props) => {
    const restaurant = useRestaurant();

    const productsByCategories = props.products.reduce(
        (acc, product) => {
            if (!acc[product.category_name]) {
                acc[product.category_name] = [];
            }
            acc[product.category_name].push(product);
            return acc;
        },
        {} as Record<string, Product[]>
    );

    return (
        <table className={classes.table}>
            <tbody>
                {Object.entries(productsByCategories).map(([category, products]) => (
                    <Fragment key={category}>
                        <tr className={classes.categoryNameRow}>
                            <td colSpan={3}>{category}</td>
                        </tr>

                        {products.map((product) => (
                            <Fragment key={product.id}>
                                <tr>
                                    <td data-testid={`product-${product.id}-quantity`}>{product.quantity}x</td>
                                    <td>
                                        <u data-testid={`product-${product.id}-name`}>
                                            {product.name} {getItemCode(product, restaurant)}
                                        </u>

                                        {product.remarks && (
                                            <p data-testid={`product-${product.id}-remarks`}>{product.remarks.trim()}</p>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }} data-testid={`product-${product.id}-total`}>
                                        {product.total_amount && formatTotal(product.total_amount, props.currency)}
                                    </td>
                                </tr>

                                {product.specifications.map((specification) => (
                                    <tr key={specification.id}>
                                        <td />
                                        <td key={specification.id} data-testid={`product-${product.id}-specification`}>
                                            + {specification.name} {getItemCode(specification, restaurant)}
                                        </td>
                                        <td>{formatTotal(specification.amount * product.quantity, props.currency)}</td>
                                    </tr>
                                ))}
                            </Fragment>
                        ))}
                    </Fragment>
                ))}
            </tbody>
        </table>
    );
};

export default ProductsTable;
