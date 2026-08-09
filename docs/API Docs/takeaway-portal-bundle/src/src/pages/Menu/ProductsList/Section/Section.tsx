import { Tooltip } from '@jet-pie/react';
import { InfoCircle } from '@jet-pie/react/esm/icons';
import { MenuCategory } from '@lo/shared/types/menuType';
import classNames from 'classnames';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../../common/js/colorTokens';
import { useIntersection } from '@lo/web/hooks/useIntersection';
import { useWindowSize } from '@lo/web/hooks/useWindowSize';
import Product from '../Product/Product';
import classes from './Section.module.scss';

type SectionProps = {
    data: MenuCategory;
    onVisibilityChange: (value: boolean) => void;
};

const Section = forwardRef<number | undefined, SectionProps>((props, ref) => {
    const {
        data: { id, name, products },
        onVisibilityChange
    } = props;
    const { t } = useTranslation();
    const sectionRef = useRef<HTMLDivElement>(null);
    const isVisible = useIntersection(sectionRef.current, '-110px');
    const { isLessThanTabletWidth } = useWindowSize();
    const sliderHeight = isLessThanTabletWidth ? 80 : 95;
    useImperativeHandle(ref, () => (sectionRef.current ? sectionRef.current.offsetTop - sliderHeight : undefined), []);

    const outOfStockCounter = products ? products.filter((product) => product.sold_out).length : 0;
    const availableCounter = products ? products.length - outOfStockCounter : 0;

    useEffect(() => onVisibilityChange(isVisible), [isVisible]);

    return (
        <div ref={sectionRef} className={classes.sectionWrapper} data-testid={`category-${id}`}>
            <div className={classes.section}>
                <div className={classes.header}>
                    <p className={classes.title} data-testid={`category-${id}-title`}>{`${name} (${products?.length})`}</p>
                    <p className={classes.subtitle}>
                        {availableCounter > 0 &&
                            t('orders.live_orders_menu.main.available_items_amount', { amount: availableCounter })}
                        {outOfStockCounter > 0 && availableCounter > 0 && ' ('}
                        {outOfStockCounter > 0 && (
                            <span
                                className={classNames({
                                    [classes.outOfStockSubtitle]: availableCounter > 0
                                })}
                            >
                                {t('orders.live_orders_menu.main.out_of_stock_items_amount', {
                                    amount: outOfStockCounter
                                })}
                            </span>
                        )}
                        {outOfStockCounter > 0 && availableCounter > 0 && ')'}
                    </p>
                    <Tooltip
                        width="200px"
                        mode="AUTO"
                        placement="auto-end"
                        content={t('orders.live_orders_menu.main.section_tip')}
                    >
                        <InfoCircle style={{ marginTop: '4px' }} width={20} height={20} fill={colors.alias.interactiveBrand} />
                    </Tooltip>
                </div>
                <div className={classes.list} data-testid={`category-${id}-products-list`}>
                    {products?.map((product) => (
                        <Product key={product.id + product.name} data={product} />
                    ))}
                </div>
            </div>
        </div>
    );
});

Section.displayName = 'Section';

export default Section;
