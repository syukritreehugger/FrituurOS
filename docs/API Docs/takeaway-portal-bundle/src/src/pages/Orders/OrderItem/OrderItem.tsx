import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Walking, Alcohol, ClockFilled } from '@jet-pie/react/esm/icons';
import truncateString from '@lo/shared/helpers/string/truncateString';
import { OrderModel } from '@lo/shared/models';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import { useIsChainAccount } from '@lo/shared/store/auth';
import { trainingElements } from '@lo/shared/types/trainings';
import ActionButton from './ActionButton/ActionButton';
import { colors } from '../../../common/js/colorTokens';
import Timer from '@lo/web/components/Timer/Timer';
import CensoredText from '@lo/web/components/UI/CensoredText/CensoredText';
import PaymentTypeIcon from '@lo/web/components/PaymentTypeIcon/PaymentTypeIcon';
import classes from './OrderItem.module.scss';
import { formatTime } from '@lo/shared/helpers/formatTime';

type OrderItemProps = {
    order: OrderModel;
};

const OrderItem: React.FC<OrderItemProps> = ({ order }) => {
    const { t } = useTranslation();
    const restaurant = useRestaurant();
    const hideSensitiveInformation = useIsChainAccount();
    const { show_customer_name, show_order_reference, show_customer_address, show_customer_city, show_customer_postcode } =
        restaurant.ui_settings;

    const requestedDeliveryTime = formatTime(order.requested_time, undefined, restaurant.timezone) ?? 'ASAP';
    const address =
        order.customer?.street && order.customer?.street_number ? `${order.customer.street} ${order.customer.street_number}` : '';
    const showActionButton = !order.is_new && !order.is_delivered && !order.is_cancelled && !order.is_next_day_scheduled;

    return (
        <div className={classes.innerContainer}>
            <Timer order={order} />
            <div className={classes.orderInfo} data-training-id={trainingElements.orderItem}>
                {order.is_delivery ? (
                    <>
                        <div
                            className={classNames({
                                [classes.marginBottom]: show_customer_postcode || show_customer_city || show_customer_address
                            })}
                        >
                            {show_customer_postcode && restaurant.is_address_visible && (
                                <span
                                    className={classes.mainText}
                                    data-testid={`order-address-postcode-${order.public_reference}`}
                                >
                                    {hideSensitiveInformation ? <CensoredText /> : order.customer?.postcode}
                                </span>
                            )}
                            {show_customer_city && restaurant.is_address_visible && (
                                <span data-testid={`order-address-city-${order.public_reference}`} className={classes.mainText}>
                                    &nbsp;
                                    {hideSensitiveInformation ? (
                                        <CensoredText placeholderText={'Cityname'} />
                                    ) : (
                                        order.customer?.city
                                    )}
                                </span>
                            )}
                            {show_customer_address && restaurant.is_address_visible && (
                                <span
                                    data-testid={`order-address-street-${order.public_reference}`}
                                    className={classNames(classes.mainText, classes.marginBottom)}
                                >
                                    {hideSensitiveInformation ? (
                                        <CensoredText placeholderText={'Streetname'} />
                                    ) : (
                                        <>
                                            {show_customer_postcode || show_customer_city ? ', ' : ''}
                                            {address.length > 34 ? truncateString(address, 34) : address}
                                        </>
                                    )}
                                </span>
                            )}
                        </div>
                        {show_customer_name &&
                            (hideSensitiveInformation ? (
                                <CensoredText />
                            ) : (
                                <p
                                    data-testid={`order-customer-name-${order.public_reference}`}
                                    className={classNames(classes.deliveryNameText, classes.marginBottom)}
                                >
                                    {order?.customer?.full_name}
                                </p>
                            ))}
                    </>
                ) : (
                    <div className={classNames(classes.pickupOrder, classes.marginBottom)}>
                        {show_customer_name &&
                            (hideSensitiveInformation ? (
                                <CensoredText />
                            ) : (
                                <p data-testid={`order-customer-name-${order.public_reference}`} className={classes.mainText}>
                                    {order?.customer?.full_name}
                                </p>
                            ))}
                        <div className={classes.pickupOrderIconRow}>
                            <Walking className={classes.pickupOrderIcon} fill={colors.alias.contentDefault} />
                            <div className={classes.pickupOrderText}>
                                {t('orders.live_orders_order_list.delivery_types.pick_up')}
                            </div>
                        </div>
                    </div>
                )}
                <div className={classes.orderReferenceContainer}>
                    {!order.is_new && (
                        <div className={classes.timeContainer}>
                            <ClockFilled className={classes.timeIcon} fill={colors.alias.contentDefault} />
                            <div data-testid={`order-requested-time-${order.public_reference}`} className={classes.timeText}>
                                {requestedDeliveryTime}
                            </div>
                        </div>
                    )}
                    {show_order_reference && (
                        <p
                            data-testid={`order-public-reference-${order.public_reference}`}
                            className={classes.orderReferenceText}
                        >
                            #{order.public_reference.toUpperCase()}
                        </p>
                    )}
                    {order.is_cancelled && (
                        <div className={classes.cancelledContainer}>
                            <div className={classes.cancelledText}>•</div>
                            <div className={classes.cancelledText}>{t('orders.live_orders_order_list.statuses.cancelled')}</div>
                        </div>
                    )}
                    {order.with_alcohol && (
                        <div className={classNames(classes.badge, classes.alcohol)}>
                            <Alcohol fill={colors.alias.contentDefault} />
                        </div>
                    )}
                    {!order.is_paid && (
                        <div className={classNames(classes.badge, classes.partiallyPaid)}>
                            <PaymentTypeIcon paymentType={order.payment_type} size={16} fill={colors.alias.contentDefault} />
                        </div>
                    )}
                </div>
            </div>

            {showActionButton && <ActionButton order={order} />}
        </div>
    );
};

export default OrderItem;
