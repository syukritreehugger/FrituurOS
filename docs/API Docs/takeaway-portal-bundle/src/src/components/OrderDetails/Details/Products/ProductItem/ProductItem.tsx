import React from 'react';
import { Product } from '@lo/shared/types/orderDataType';
import Extras from '../Components/Extras';
import { OrderModel } from '@lo/shared/models';
import classes from './ProductItem.module.scss';
import { getOrderItemCode } from '@lo/shared/helpers/order/getOrderItemCode';
import { trainingElements } from '@lo/shared/types/trainings';

type ProductItemProps = {
    product: Product;
    currency: OrderModel['currency'];
    productIdLength: number | null;
    showCode: boolean;
};

const ProductItem: React.FC<ProductItemProps> = (props) => {
    const { product, currency, productIdLength, showCode } = props;
    const amount = product.total_amount ? product.total_amount.toFixed(2) : product.amount.toFixed(2);
    const code = getOrderItemCode(product, productIdLength);

    return (
        <div data-testid="order-details-product" className={classes.container}>
            <p data-testid="order-details-product-quantity" className={classes.quantity}>
                {product.quantity}
            </p>

            <div className={classes.item}>
                <div className={classes.main}>
                    <div data-training-id={trainingElements.orderProducts}>
                        <p className={classes.name}>{product.name}</p>
                        {showCode && code && <p className={classes.code}>#{code}</p>}
                    </div>
                    <p className={classes.total} data-testid="order-details-product-amount">
                        {currency} {amount}
                    </p>
                </div>

                <Extras product={product} currency={currency} showCode={showCode} />
            </div>
        </div>
    );
};

export default ProductItem;
