import React, { FC } from 'react';
import { Skeleton } from '@jet-pie/react';
import classes from './OrderItemSkeleton.module.scss';

const OrderItemSkeleton: FC = () => {
    return (
        <div className={classes.container} data-testid="order-item-skeleton">
            <div>
                <Skeleton variant="circle" width="56px" height="56px" />
            </div>

            <div className={classes.info}>
                <Skeleton variant="text" width="190px" height="20px" />
                <Skeleton variant="text" width="100px" height="20px" />
            </div>

            <div>
                <Skeleton variant="circle" width="48px" height="48px" />
            </div>
        </div>
    );
};

export default OrderItemSkeleton;
