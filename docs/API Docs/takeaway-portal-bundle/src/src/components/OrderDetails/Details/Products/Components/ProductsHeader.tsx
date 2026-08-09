import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alcohol } from '@jet-pie/react/esm/icons';
import { getOrderDetailsProductsTitle } from '@lo/shared/helpers/order/getOrderDetailsProductsTitle';
import getOrderPaymentTitle from '@lo/shared/helpers/order/getOrderPaymentTitle';
import Comment from '../../Comment/Comment';
import { OrderModel } from '@lo/shared/models';
import classes from '../Products.module.scss';
import PaymentTypeIcon from '../../../../PaymentTypeIcon/PaymentTypeIcon';

type ProductsHeaderProps = {
    order: OrderModel;
};

const ProductsHeader: React.FC<ProductsHeaderProps> = (props) => {
    const { order } = props;
    const { t } = useTranslation();

    const title = getOrderDetailsProductsTitle(order, t);

    return (
        <div className={classes.title}>
            <h5 data-testid="order-details-toggle-products">{title}</h5>
            <div className={classes.comments}>
                {order.with_alcohol && (
                    <Comment
                        icon={<Alcohol height={14} width={14} />}
                        message={t('orders.live_orders_order_details.titles.alcohol')}
                        testID="order-details-alcohol-remark"
                    />
                )}
                <Comment
                    testID="order-details-payment-type"
                    icon={<PaymentTypeIcon paymentType={order.payment_type} size={14} />}
                    message={getOrderPaymentTitle(order.payment_type)}
                    variant={order.is_paid ? 'ghost' : 'error'}
                />
            </div>
        </div>
    );
};

export default ProductsHeader;
