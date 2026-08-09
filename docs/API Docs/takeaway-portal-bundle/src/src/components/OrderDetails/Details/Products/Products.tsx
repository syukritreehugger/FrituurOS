import React from 'react';
import groupProductsByCategories from '@lo/shared/helpers/order/groupProductsByCategories';
import ProductsHeader from './Components/ProductsHeader';
import ProductItem from './ProductItem/ProductItem';
import { OrderModel } from '@lo/shared/models';
import classes from './Products.module.scss';

type ProductsProps = {
    order: OrderModel;
    showCategories: boolean;
    productIdLength: number | null;
    showCode: boolean;
};

const Products: React.FC<ProductsProps> = (props) => {
    const { order, showCategories, productIdLength, showCode } = props;
    const categories = Object.entries(groupProductsByCategories(order.products));

    return (
        <div className={classes.products} data-testid="order-details-products">
            <ProductsHeader order={order} />

            {categories.map(([category, products]) => (
                <div key={category} className={classes.category}>
                    {showCategories && <h5 className={classes.categoryName}>{category}</h5>}
                    {products.map((product) => (
                        <ProductItem
                            key={product.id}
                            product={product}
                            currency={order.currency}
                            productIdLength={productIdLength}
                            showCode={showCode}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Products;
