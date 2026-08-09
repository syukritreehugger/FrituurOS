import React, { FC } from 'react';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { getOrderItemCode } from '@lo/shared/helpers/order/getOrderItemCode';
import { Specification as SpecificationType } from '@lo/shared/types/orderDataType';
import classes from './Specification.module.scss';

type SpecificationProps = {
    item: SpecificationType;
    showCode: boolean;
    currency: string;
    quantity: number;
    productIdLength: number;
};

const Specification: FC<SpecificationProps> = (props) => {
    const restaurant = useRestaurant();

    const code = getOrderItemCode(props.item, props.productIdLength);
    const showCode = code && restaurant.ui_settings.show_product_id;

    return (
        <p data-testid="order-details-specification" className={classes.specification}>
            <span data-testid="order-details-specification-name">
                + {props.item.name} {showCode && <span data-testid="order-details-specification-code">[#{code}]</span>}
            </span>
            <span className={classes.price} data-testid="order-details-specification-amount">
                {props.currency} {(props.item.amount * props.quantity).toFixed(2)}
            </span>
        </p>
    );
};

export default Specification;
