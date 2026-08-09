import React, { useEffect, useState } from 'react';
import { MenuProduct } from '@lo/shared/types/menuType';
import ToggleSwitcher from '@lo/web/components/UI/ToggleSwitcher/ToggleSwitcher';
import classes from './Product.module.scss';
import { useSearchFilterIsActive } from '@lo/shared/store/menuSearchFilter';
import ProductTogglePopup from '../ProductTogglePopup/ProductTogglePopup';
import { differenceInCalendarDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import SearchResultItem from '../../Toolbar/SearchResultItem/SearchResultItem';
import { useUpdateProduct } from '@lo/shared/hooks/useUpdateProduct';

type ProductProps = {
    data: MenuProduct;
};

const Product: React.FC<ProductProps> = (props) => {
    const { data } = props;
    const { t } = useTranslation();
    const { takeOffline, takeOnline, isPending, isSuccess } = useUpdateProduct();
    const isSearchFilterActive = useSearchFilterIsActive();
    const [productToToggle, setProductToToggle] = useState<MenuProduct | null>(null);
    const backToStockDays =
        data.sold_out && data.back_to_stock_at ? differenceInCalendarDays(data.back_to_stock_at, new Date()) : null;

    useEffect(() => {
        if (isSuccess) setProductToToggle(null);
    }, [isSuccess]);

    const handleProductOnline = () => {
        if (data.sold_out) return takeOnline(data.name, data.id.toString());

        // Temp: Skip product toggle popup. Back to stock date is not supported in TKWY OneMenu yet
        // setProductToToggle(data);
        return takeOffline(data.name, data.id.toString());
    };

    const handleProductOffline = (backToStockAt?: Date) => {
        takeOffline(data.name, data.id.toString(), backToStockAt);
    };

    return (
        <>
            <div className={classes.item}>
                {isSearchFilterActive ? (
                    <SearchResultItem
                        result={{ name: data.name, id: data.id.toString(), code: data.code }}
                        containerClassName={classes.title}
                    />
                ) : (
                    <p className={classes.title}>{data.name}</p>
                )}
                {backToStockDays ? (
                    <p className={classNames(classes.tag, { [classes.error]: backToStockDays > 7 })}>
                        {backToStockDays === 1
                            ? t('orders.live_orders_menu.main.back_tomorrow')
                            : t('orders.live_orders_menu.main.out_of_stock_for_days', {
                                  days: backToStockDays > 7 ? '7+' : backToStockDays
                              })}
                    </p>
                ) : null}
                <ToggleSwitcher
                    dataTestId={`toggle-switcher-${data.category_id}-${data.id}-${!data.sold_out ? 'on' : 'off'}`}
                    loading={isPending}
                    toggleSwitcher={handleProductOnline}
                    isSwitcherOn={!data.sold_out}
                />
            </div>

            <ProductTogglePopup
                isOpen={!!productToToggle}
                isLoading={isPending}
                product={productToToggle}
                onConfirm={handleProductOffline}
                onClose={() => setProductToToggle(null)}
            />
        </>
    );
};

export default Product;
