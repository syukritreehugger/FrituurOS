import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import refundIllustration from '../../../static/images/refund.svg';
import classes from './UnavailableItemsMessage.module.scss';
import { EyeOffFilled, EyeOnFilled } from '@jet-pie/react/esm/icons';
import ProductItem from '../ProductItem/ProductItem';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import { OrderModel } from '@lo/shared/models';

type UnavailableItemsMessageProps = {
    order: OrderModel;
};

const UnavailableItemsMessage: React.FC<UnavailableItemsMessageProps> = (props) => {
    const { order } = props;
    const { t } = useTranslation();
    const { isLessThanTabletWidth } = useWindowSize();
    const [isItemsVisible, setIsItemsVisible] = useState(false);

    const items = order.products.filter((product) => !product.is_available);
    const total = useMemo(() => {
        return items.reduce((value, product) => {
            const specificationsTotal = product.specifications.reduce(
                (sum, specification) => sum + specification.amount * product.quantity,
                0
            );
            return value + (product.total_amount ? product.total_amount : product.amount) + specificationsTotal;
        }, 0);
    }, []);

    const handleShowItemsClick = () => {
        setIsItemsVisible(!isItemsVisible);
    };

    return (
        <div className={classes.container}>
            {!isLessThanTabletWidth && <img src={refundIllustration} className={classes.image} />}
            <div className={classes.content}>
                <p className={classes.title}>
                    {t('orders.live_orders_order_details.unavailable_items.button_title')} ({items.length})
                </p>
                <div className={classes.items}>
                    <p data-testid="unavailable-items-message-refunded" className={classes.refundTitle}>
                        {t('orders.live_orders_order_details.unavailable_items.refunded_message', {
                            amount: `${order.currency} ${total.toFixed(2)}`
                        })}
                    </p>
                    <button
                        data-testid="unavailable-items-message-show-button"
                        className={classes.showItemsButton}
                        onClick={handleShowItemsClick}
                    >
                        {isItemsVisible ? (
                            <EyeOffFilled className={classes.eyeIcon} />
                        ) : (
                            <EyeOnFilled className={classes.eyeIcon} />
                        )}
                        {t('orders.live_orders_order_details.unavailable_items.show_items')}
                    </button>
                </div>
                {isItemsVisible && (
                    <ul data-testid="unavailable-items-list" className={classes.unavailableItemsList}>
                        {items.map((product) => {
                            return (
                                <ProductItem
                                    key={product.menu_product_id}
                                    product={product}
                                    currency={order.currency}
                                    hideRemarks
                                />
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default UnavailableItemsMessage;
