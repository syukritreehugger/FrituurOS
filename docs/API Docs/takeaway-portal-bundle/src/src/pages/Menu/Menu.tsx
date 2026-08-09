import React, { useState } from 'react';
import Toolbar from './Toolbar/Toolbar';
import ProductsList from './ProductsList/ProductsList';
import CategorySlider from './CategorySlider/CategorySlider';
import allInStockImage from '../../static/images/all-in-stock.png';
import { useMenuFilters } from './hooks/useMenuFilters';
import MenuSkeleton from './MenuSkeleton/MenuSkeleton';
import classes from './Menu.module.scss';
import { Button } from '@jet-pie/react';
import { useOutOfStockFilterActions, useOutOfStockFilterIsActive } from '@lo/shared/store/menuOutOfStockFilter';
import { useSearchFilterActions, useSearchFilterIsActive } from '@lo/shared/store/menuSearchFilter';
import { useTranslation } from 'react-i18next';
import analytics from '@lo/shared/services/analytics';
import { useMenuData } from './hooks/useMenuData';

const Menu: React.FC = () => {
    const { menu, isLoading } = useMenuData();
    const { data: filteredMenuCategories } = useMenuFilters(menu?.categories || []);
    const { toggle: toggleOutOfStockFilter } = useOutOfStockFilterActions();
    const { clear: clearSearchFilter } = useSearchFilterActions();
    const isOutOfStockFilterActive = useOutOfStockFilterIsActive();
    const isSearchFilterActive = useSearchFilterIsActive();

    const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const { t } = useTranslation();

    const clearFilters = () => {
        analytics.menu.turnedOffOutOfStockFilter('button');
        clearSearchFilter();
        if (isOutOfStockFilterActive) toggleOutOfStockFilter();
    };

    const onCategorySelect = (id: number) => {
        analytics.menu.selectedCategory(id.toString());
        setSelectedCategoryId(id);
    };

    return (
        <div className={classes.menuPage}>
            <Toolbar updatedAt={menu?.updated_at} showSkeletonLoaders={isLoading} />

            {isLoading ? (
                <MenuSkeleton />
            ) : (
                <div className={classes.main}>
                    {!isSearchFilterActive && (
                        <CategorySlider
                            menuCategories={filteredMenuCategories}
                            activeCategoryIndex={activeCategoryIndex}
                            onCategorySelect={onCategorySelect}
                        />
                    )}
                    {filteredMenuCategories.length > 0 ? (
                        <ProductsList
                            menuCategories={filteredMenuCategories}
                            selectedCategoryId={selectedCategoryId}
                            onActiveCategoryChange={setActiveCategoryIndex}
                        />
                    ) : (
                        <div className={classes.clearFiltersContainer}>
                            <img className={classes.allInStockImage} src={allInStockImage} />
                            <p className={classes.allInStockLabel}>{t('orders.live_orders_menu.main.all_items_in_stock')}</p>
                            <Button
                                data-testid="clear-all-filters-button"
                                disabled={!isSearchFilterActive && !isOutOfStockFilterActive}
                                className={classes.clearFiltersButton}
                                size="medium"
                                onClick={clearFilters}
                            >
                                {t('orders.live_orders_menu.main.clear_filters')}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Menu;
