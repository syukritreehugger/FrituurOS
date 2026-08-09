import React from 'react';
import { Product } from '@lo/shared/types/orderDataType';
import Comment from '../../Comment/Comment';
import classes from '../ProductItem/ProductItem.module.scss';

type ExtrasProps = {
    product: Product;
    currency: string;
    showCode: boolean;
};

const Extras: React.FC<ExtrasProps> = (props) => {
    const { product, currency, showCode } = props;

    return (
        <div className={classes.extras}>
            <div className={classes.specifications}>
                {product.specifications.map((item) => (
                    <div data-testid="order-details-specification" className={classes.specification} key={item.id}>
                        <div>
                            <p data-testid="order-details-specification-name">+ {item.name}</p>
                            {showCode && item.code && (
                                <p className={classes.specificationCode} data-testid="order-details-specification-code">
                                    {`#${item.code.toUpperCase()}`}
                                </p>
                            )}
                        </div>
                        <p className={classes.productSpecificationPrice} data-testid="order-details-specification-amount">
                            {currency} {(item.amount * product.quantity).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>

            {product.remarks && <Comment message={product.remarks} variant="chat" testID="order-details-product-remarks" />}
        </div>
    );
};

export default Extras;
