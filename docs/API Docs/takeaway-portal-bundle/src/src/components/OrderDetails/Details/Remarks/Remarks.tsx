import React from 'react';
import { OrderModel, RestaurantModel } from '@lo/shared/models';
import { DriverMoped, Food } from '@jet-pie/react/esm/icons';
import Comment from '../Comment/Comment';

type RemarksProps = {
    customer: OrderModel['customer'];
    remarks: OrderModel['remarks'];
    restaurant: RestaurantModel;
    hasChainRestaurants: boolean;
};

const Remarks: React.FC<RemarksProps> = (props) => {
    const { customer, remarks, restaurant, hasChainRestaurants } = props;

    if (!customer) return null;
    return (
        <div>
            <Comment icon={<Food width={14} height={14} />} message={remarks} variant="chat" testID="order-details-remark" />
            {customer.extra &&
                customer.extra.length > 0 &&
                restaurant.is_address_visible &&
                !hasChainRestaurants &&
                customer.extra.map((extra, key) => (
                    <Comment
                        data-testid={`order-details-customer-extra-${key}`}
                        icon={<DriverMoped width={14} height={14} />}
                        message={extra}
                        variant="chat"
                        key={key}
                    />
                ))}
        </div>
    );
};

export default Remarks;
