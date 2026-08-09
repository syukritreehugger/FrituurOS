import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@jet-pie/react';
import useCanPrintOrder from '@lo/shared/hooks/useCanPrintOrder';
import { Moped, ClockFilled, Printer, Walking } from '@jet-pie/react/esm/icons';
import { getOrderDetailsHeaderData } from '@lo/shared/helpers/order/getOrderDetailsHeaderData';
import Timer from '../../Timer/Timer';
import CensoredText from '../../UI/CensoredText/CensoredText';
import ExtraActions from '../ExtraActions/ExtraActions';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import { ExtraActionsParams } from '../hooks/useExtraActions';
import { OrderModel, RestaurantModel } from '@lo/shared/models';
import classes from './Header.module.scss';
import { useNavigate } from 'react-router';
import { formatTime } from '@lo/shared/helpers/formatTime';
import { colors } from '../../../common/js/colorTokens';

type HeaderProps = {
    order: OrderModel;
    restaurant: RestaurantModel;
    hideSensitiveInformation: boolean;
    extraActions: ExtraActionsParams;
    showShadow: boolean;
    isOrderHistory: boolean;
};

const Header: React.FC<HeaderProps> = (props) => {
    const { order, restaurant, hideSensitiveInformation, extraActions, showShadow, isOrderHistory } = props;

    const { t } = useTranslation();
    const { title, deliveryTypeTitle } = getOrderDetailsHeaderData(order, restaurant, t);
    const DeliveryTypeIcon = order.is_delivery ? Moped : Walking;
    const { isLessThanTabletWidth } = useWindowSize();
    const { canPrint } = useCanPrintOrder(order);
    const navigate = useNavigate();

    const printReceipt = () => navigate(`/orders/${order.id}/receipt`);

    return (
        <div
            className={classNames(classes.header, {
                [classes.withShadow]: showShadow && !isOrderHistory,
                [classes.narrow]: isOrderHistory,
                [classes.sticky]: !isLessThanTabletWidth && !isOrderHistory
            })}
        >
            <Timer order={order} />

            <div className={classes.title}>
                {hideSensitiveInformation ? <CensoredText /> : <h5 data-testid="order-details-address-heading">{title}</h5>}

                <div className={classes.subtitle}>
                    {order.is_next_day_scheduled && (
                        <div>
                            <ClockFilled className={classes.timeIcon} fill={colors.alias.contentDefault} />
                            <span className={classes.requestedTime} data-testid="order-details-requested-time">
                                {formatTime(order.requested_time, undefined, restaurant.timezone)}
                            </span>
                        </div>
                    )}

                    <p data-testid={`order-public-reference-${order.public_reference}`} className={classes.reference}>
                        #{order.public_reference.toUpperCase()}
                    </p>

                    <div>
                        <DeliveryTypeIcon width={16} height={16} />
                        <p data-testid={`order-delivery-type-${order.public_reference}`}>{deliveryTypeTitle}</p>
                    </div>
                </div>
            </div>
            {!isLessThanTabletWidth && !isOrderHistory && (
                <ExtraActions
                    order={order}
                    opened={extraActions.opened}
                    toggleOpened={extraActions.toggle}
                    openOrderListSettingsPopup={extraActions.toggleOrderListSettingsPopup}
                    openUnavailableItemsPopup={extraActions.toggleUnavailableItemsPopup}
                    toggleUpdateConfirmedTimes={extraActions.toggleUpdateConfirmedTimes}
                />
            )}
            {isOrderHistory && (
                <div className={classes.printButton}>
                    <IconButton variant="ghost" size="medium" icon={<Printer />} onClick={printReceipt} disabled={!canPrint} />
                </div>
            )}
        </div>
    );
};

export default Header;
