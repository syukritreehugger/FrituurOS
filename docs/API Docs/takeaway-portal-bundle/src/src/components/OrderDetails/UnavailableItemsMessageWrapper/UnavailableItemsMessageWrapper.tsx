import React from 'react';
import UnavailableItemsMessage from '../UnavailableItemsMessage/UnavailableItemsMessage';
import { OrderModel, RestaurantModel } from '@lo/shared/models';
import classes from './UnavailableItemsMessageWrapper.module.scss';

const UnavailableItemsMessageWrapper: React.FC<{ order: OrderModel; restaurant: RestaurantModel }> = (props) => {
    const { order, restaurant } = props;

    if (!(order.has_unavailable_products && restaurant.is_grocery_unified_flow)) return null;
    return (
        <div className={classes.container}>
            <UnavailableItemsMessage order={order} />
        </div>
    );
};

export default UnavailableItemsMessageWrapper;
