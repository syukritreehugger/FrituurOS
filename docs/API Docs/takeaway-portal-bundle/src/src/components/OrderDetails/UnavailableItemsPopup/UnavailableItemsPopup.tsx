import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Product } from '@lo/shared/types/orderDataType';
import { OrderModel } from '@lo/shared/models';
import { Button, IconButton, Modal, SideSheet, Skeleton } from '@jet-pie/react';
import { usePortal } from '@lo/web/hooks/usePortal';
import { useTranslation } from 'react-i18next';
import ToggleSwitcher from '../../UI/ToggleSwitcher/ToggleSwitcher';
import AlertMessage from '../../UI/AlertMessage/AlertMessage';
import classes from './UnavailableItemsPopup.module.scss';
import useCreateOrderIssue from '@lo/shared/hooks/useCreateOrderIssue';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import { Close } from '@jet-pie/react/esm/icons';
import ConfirmPopup from './ConfirmPopup';
import usePinProtection from '@lo/shared/hooks/usePinProtection';
import { getOrderItemCode } from '@lo/shared/helpers/order/getOrderItemCode';

export type UnavailableItemsPopupProps = {
    order: OrderModel;
    contact: string;
    onClose: () => void;
};

const UnavailableItemsPopup: React.FC<UnavailableItemsPopupProps> = (props) => {
    const { order, onClose, contact } = props;

    const { t } = useTranslation();
    const [deactivatedProductIds, setDeactivatedProductIds] = useState<string[]>([]);
    const [isConfirmPopupVisible, setConfirmPopupVisible] = useState(false);
    const portal = usePortal();
    const { mutate: createOrderIssue } = useCreateOrderIssue();
    const { isLessThanTabletWidth } = useWindowSize();
    const { checkPin, pinPopupIsOpen, pinIsChecked } = usePinProtection(onClose);
    const deactivatedProducts = useMemo(
        () =>
            deactivatedProductIds
                .map((item) => order.products.find((product) => product.menu_product_id === item))
                .filter((product): product is Product => !!product),
        [deactivatedProductIds]
    );

    useEffect(() => {
        checkPin();
    }, []);

    const handleToggleProduct = (product: Product) => {
        if (deactivatedProductIds.includes(product.menu_product_id)) {
            setDeactivatedProductIds(deactivatedProductIds.filter((itemId) => itemId !== product.menu_product_id));
        } else {
            setDeactivatedProductIds([...deactivatedProductIds, product.menu_product_id]);
        }
    };

    const showConfirmPopup = () => {
        setConfirmPopupVisible(true);
    };

    const handleConfirm = () => {
        const partnerProductIds = deactivatedProducts.reduce<string[]>(
            (ids, product) => [...ids, ...(product.partner_product_ids || [])],
            []
        );
        createOrderIssue({ id: order.id, partnerProductIds, menuProductIds: deactivatedProductIds });
        onClose();
    };

    const wrapper = (children: ReactNode) => (
        <>
            {isLessThanTabletWidth ? (
                <SideSheet
                    id="unavailableItemsSideSheet"
                    isOpen={pinIsChecked && !pinPopupIsOpen}
                    onShowSideSheet={onClose}
                    orientation="right"
                    width="100%"
                    hideOnOutsideClick
                    hideHeader
                    backdrop
                >
                    <div className={classes.sideSheetHeader}>
                        <p className={classes.sideSheetTitle}>
                            {t('orders.live_orders_order_details.unavailable_items.popup_title')}
                        </p>
                        <IconButton onClick={onClose} icon={<Close />} variant="ghost-tertiary" size="x-small" />
                    </div>
                    <div className={classes.sideSheetContainer}>{children}</div>
                </SideSheet>
            ) : (
                portal(
                    <Modal
                        title={{
                            text:
                                t('orders.live_orders_order_details.unavailable_items.popup_title') ??
                                'Which items are unavailable?'
                        }}
                        isOpen={pinIsChecked && !pinPopupIsOpen}
                        onClose={onClose}
                        size="medium"
                        variant={isLessThanTabletWidth ? 'narrow' : 'wide'}
                    >
                        {children}
                    </Modal>
                )
            )}
        </>
    );

    if (isConfirmPopupVisible) {
        return (
            <ConfirmPopup
                products={deactivatedProducts.length === order.products.length ? [] : deactivatedProducts}
                contact={contact}
                onClose={handleConfirm}
            />
        );
    }

    return wrapper(
        <div className={classes.container} data-testid="unavailable-items-popup">
            <div className={classes.list}>
                <div className={classes.header}>
                    <p className={classes.heading}>
                        {t('orders.live_orders_order_details.unavailable_items.items_column_title')}
                    </p>
                    <p className={classes.heading}>
                        {t('orders.live_orders_order_details.unavailable_items.availability_column_title')}
                    </p>
                </div>
                {order.products.map((product) => {
                    const code = getOrderItemCode(product);
                    const hasCode = typeof code === 'string' && code.length > 0;
                    if (!product.menu_product_id) return null;
                    return (
                        <div key={product.id} className={classes.item}>
                            <p className={classes.product}>
                                <span className={classes.productQuantity}>{product.quantity}</span>
                                <span className={classes.productName}>
                                    {product.name} {hasCode && `(#${code})`}
                                </span>
                            </p>
                            {!deactivatedProductIds ? (
                                <Skeleton variant="box" width="44px" height="22px" />
                            ) : (
                                <ToggleSwitcher
                                    dataTestId={`product-switcher-${product.id}`}
                                    isSwitcherOn={!deactivatedProductIds.includes(product.menu_product_id)}
                                    toggleSwitcher={() => handleToggleProduct(product)}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            <div className={classes.confirmContainer}>
                <AlertMessage message={t('orders.live_orders_order_details.unavailable_items.once_per_order_message')} />
                <Button
                    fullWidth={isLessThanTabletWidth}
                    data-testid="confirm-unavailable-items-button"
                    disabled={!deactivatedProductIds.length}
                    onClick={showConfirmPopup}
                    size={isLessThanTabletWidth ? 'medium' : 'large'}
                >
                    {t('orders.live_orders_order_details.unavailable_items.confirm')}
                </Button>
            </div>
        </div>
    );
};

export default UnavailableItemsPopup;
