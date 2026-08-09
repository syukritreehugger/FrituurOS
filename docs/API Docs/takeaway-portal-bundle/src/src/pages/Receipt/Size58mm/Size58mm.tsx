import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import usePhoneMasking from '@lo/shared/hooks/usePhoneMasking';
import { formatTime, formatTotal } from '@lo/shared/helpers/receipt';
import getOrderPaymentTitle from '@lo/shared/helpers/order/getOrderPaymentTitle';
import { PAYMENT_TYPES } from '@lo/shared/constants';
import useConvertCustomerTotal from '@lo/shared/hooks/useConvertCustomerTotal';
import { OrderModel } from '@lo/shared/models';
import config from '@lo/shared/services/config';
import AuthenticatedImage from '@lo/web/components/AuthenticatedImage/AuthenticatedImage';
import ProductsTable from './ProductsTable/ProductsTable';
import { Product } from '@lo/shared/types/orderDataType';
import TotalTable from './TotalTable';
import useReceiptAddressPermissions from '../useReceiptAddressPermissions';
import logoSrc from '../../../static/images/icon-black.svg';
import classes from './Size58mm.module.scss';

type Size58mmProps = {
    order: OrderModel;
    onLoad: () => void;
};

const Size58mm: FC<Size58mmProps> = ({ order, onLoad }) => {
    const restaurant = useRestaurant();
    const { t } = useTranslation();
    const { visiblePhoneNumber, phoneMaskingCode } = usePhoneMasking(order);
    const shouldRenderQR = restaurant.is_own_delivery && Boolean(order.global_id);
    const [isLoadingQR, setIsLoadingQR] = useState(shouldRenderQR);
    const { shouldConvert, convertedCustomerTotal, conversionRate } = useConvertCustomerTotal(order);

    const isLoaded = !isLoadingQR && (!shouldConvert || convertedCustomerTotal !== undefined);

    useEffect(() => {
        if (isLoaded) onLoad();
    }, [isLoaded]);

    const [availableProducts, unavailableProducts] = order.products.reduce(
        (acc, product) => {
            if (product.is_available) {
                acc[0].push(product);
            } else {
                acc[1].push(product);
            }

            return acc;
        },
        [[], []] as [Product[], Product[]]
    );

    const permissions = useReceiptAddressPermissions(restaurant, order, visiblePhoneNumber);

    return (
        <div
            className={classes.container}
            data-testid="receipt-content"
            style={{ visibility: isLoadingQR ? 'hidden' : 'visible' }}
        >
            <img width={50} height={50} src={logoSrc} alt="Logo" />

            <p data-testid="restaurant-address">
                {restaurant.name}, {restaurant.street} {restaurant.street_number}, {restaurant.postcode}
            </p>

            <p>
                {restaurant.city}, {t('orders.live_orders_receipt.main.tel')}: {restaurant.phone_number}
            </p>

            <h3 data-testid="order-reference">{order.public_reference}</h3>

            <p data-testid="placed-date">
                {order.placed_date.toLocaleDateString()} {formatTime(order.placed_date, restaurant.timezone)}
            </p>

            <div className={classes.divider} />

            <h2>
                {order.is_delivery
                    ? t('orders.live_orders_order_list.delivery_types.delivery')
                    : t('orders.live_orders_order_list.delivery_types.pick_up')}
            </h2>

            <h2>
                {restaurant.is_own_delivery
                    ? t('orders.live_orders_receipt.main.confirm_time')
                    : t('orders.live_orders_receipt.main.pickup_eta')}
            </h2>

            <h2 data-testid="delivery-time">
                {restaurant.is_own_delivery
                    ? formatTime(order.restaurant_estimated_delivery_time, restaurant.timezone)
                    : formatTime(order.delivery_service_pickup_time, restaurant.timezone)}
            </h2>

            {order.customer && (
                <div className={classes.left} data-testid="customer-info">
                    {order.customer.full_name && <p>{order.customer.full_name}</p>}

                    {permissions.showAddress && (
                        <p>
                            {order.customer.street ? order.customer.street : ''}{' '}
                            {permissions.showStreetNumber && order.customer.street_number ? order.customer.street_number : ''}
                        </p>
                    )}

                    {permissions.showAddress && (
                        <p>
                            {order.customer.postcode ? order.customer.postcode : ''}{' '}
                            {order.customer.city ? order.customer.city : ''}
                        </p>
                    )}

                    {permissions.showExtras &&
                        Array.isArray(order.customer.extra) &&
                        order.customer.extra.map((line, index) => <p key={index}>{line}</p>)}

                    {permissions.showCompanyName && order.customer.company_name && <p>{order.customer.company_name}</p>}

                    {permissions.showTaxId && <p>{`NIP: ${order.customer.tax_id}`}</p>}

                    {permissions.showCustomerPhoneNumber && (
                        <>
                            <div data-testid="customer-phone">
                                {t('orders.live_orders_receipt.main.tel')}: {visiblePhoneNumber}
                            </div>
                            {phoneMaskingCode && (
                                <div data-testid="customer-phone-masking-code">
                                    {t('orders.live_orders_order_details.titles.verification_code')}: {phoneMaskingCode}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className={classes.divider} />

            <ProductsTable products={availableProducts} currency={order.currency} />

            <div className={classes.divider} />

            {unavailableProducts.length > 0 && (
                <>
                    <p className={classes.left} style={{ marginBottom: '4px' }}>
                        <b>{t('orders.live_orders_order_details.unavailable_items.button_title')}:</b>
                    </p>
                    <ProductsTable products={unavailableProducts} currency={order.currency} />
                    <div className={classes.divider} />
                </>
            )}

            {order.stampcards_total > 0 && (
                <TotalTable
                    title={t('orders.live_orders_receipt.main.stampcard')}
                    value={'-' + formatTotal(order.stampcards_total, order.currency)}
                    dataTestId="stampcard"
                />
            )}

            {order.delivery_fee > 0 && (
                <TotalTable
                    title={t('orders.live_orders_receipt.main.delivery_costs')}
                    value={formatTotal(order.delivery_fee, order.currency)}
                    dataTestId="delivery-fee"
                />
            )}

            {order.service_fee > 0 && (
                <TotalTable
                    title={t('orders.live_orders_order_details.titles.service_fee')}
                    value={formatTotal(order.service_fee, order.currency)}
                    dataTestId="service-fee"
                />
            )}

            {(order.small_order_fee ?? 0) > 0 && (
                <TotalTable
                    title={t('orders.live_orders_order_details.titles.small_order_fee')}
                    value={formatTotal(order.small_order_fee ?? 0, order.currency)}
                    dataTestId="small-order-fee"
                />
            )}

            <TotalTable
                title={t('orders.live_orders_order_details.titles.total')}
                value={formatTotal(order.customer_total, order.currency)}
            />

            {convertedCustomerTotal !== undefined && (
                <TotalTable title="" value={formatTotal(convertedCustomerTotal, 'EUR')} dataTestId="converted-customer-total" />
            )}

            <div className={classes.divider} />

            {order.with_alcohol && (
                <>
                    <p data-testid="alcohol-warning">{t('orders.live_orders_receipt.main.alcohol_warning')}</p>
                    <div className={classes.divider} />
                </>
            )}

            {order.remarks && (
                <>
                    <p className={classes.left} data-testid="remarks">
                        <b>{t('orders.live_orders_receipt.main.comments')}:</b> {order.remarks.trim()}
                    </p>
                    <div className={classes.divider} />
                </>
            )}

            {config.release && <p className={classes.left}>v{config.release}</p>}

            <p>
                <u>{t('orders.live_orders_receipt.main.important')}:</u>
            </p>

            <h2>
                {order.is_paid
                    ? t('orders.live_orders_receipt.main.order_paid_online')
                    : `${t('orders.live_orders_receipt.main.order_has_not')} ${t('orders.live_orders_receipt.main.been_paid')}`}
            </h2>

            <h4>
                {t('orders.live_orders_receipt.main.payment', 'Payment')}: {getOrderPaymentTitle(order.payment_type)}
            </h4>

            {order.payment_type === PAYMENT_TYPES.CASH && order.payment?.pays_with && (
                <h4>
                    {t('orders.live_orders_order_details.titles.pays_with')}{' '}
                    {formatTotal(Number(order.payment.pays_with), order.currency)}
                </h4>
            )}

            {conversionRate && <h4 data-testid="conversion-rate">{conversionRate}</h4>}

            {shouldRenderQR && (
                <>
                    <br />
                    <AuthenticatedImage
                        src={`${config.apiUrl}/orders/global/${order.global_id}/qr.svg`}
                        width="60%"
                        alt="QR Ref"
                        onLoad={() => setIsLoadingQR(false)}
                        onError={() => setIsLoadingQR(false)}
                    />
                    <p>{t('orders.live_orders_receipt.main.scan_the_qr')}</p>
                </>
            )}

            <div className={classes.divider} />

            <p>{t('orders.live_orders_receipt.main.not_a_bill')}</p>
        </div>
    );
};

export default Size58mm;
