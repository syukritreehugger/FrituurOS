import React, { Fragment } from 'react';
import classNames from 'classnames';
import { Product } from '@lo/shared/types/orderDataType';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import classes from './ProductItem.module.scss';
import { getOrderItemCode } from '@lo/shared/helpers/order/getOrderItemCode';
import Specification from '../Specification/Specification';

type ProductItemProps = {
    product: Product;
    currency: string;
    hideRemarks?: boolean;
};

const ProductItem: React.FC<ProductItemProps> = ({ product, currency, hideRemarks = false }) => {
    const restaurant = useRestaurant();
    const showCode = restaurant.ui_settings.show_product_id;

    const productIdLength = restaurant.receipt_settings.product_id_length;
    const hasRemarks = product.remarks && product.remarks.length > 0;
    const productCode = getOrderItemCode(product, productIdLength);
    const amount = product.total_amount ? product.total_amount.toFixed(2) : product.amount.toFixed(2);

    return (
        <Fragment>
            <div
                data-testid="order-details-product"
                className={classNames(classes.product, { [classes.withItems]: product.specifications.length > 0 })}
            >
                <span className={classes.productQuantity} data-testid="order-details-product-quantity">
                    {product.quantity}
                </span>
                <span className={classes.productName} data-testid="order-details-product-name">
                    {showCode && productCode && (
                        <span className={classes.productCode} data-testid="order-details-product-code">
                            #{productCode}
                        </span>
                    )}
                    {product.name}
                </span>
                <span className={classes.productAmount} data-testid="order-details-product-amount">
                    {currency} {amount}
                </span>
            </div>

            {!hideRemarks && hasRemarks && (
                <span className={classes.productRemarks} data-testid="order-details-product-remarks">
                    &quot;{product.remarks}&quot;
                </span>
            )}

            {product.specifications.map((item) => (
                <Specification
                    key={item.id}
                    item={item}
                    showCode={showCode}
                    currency={currency}
                    quantity={product.quantity}
                    productIdLength={productIdLength || 5}
                />
            ))}
        </Fragment>
    );
};

export default ProductItem;
