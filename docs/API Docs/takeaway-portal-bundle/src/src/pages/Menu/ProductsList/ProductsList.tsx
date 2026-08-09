import React, { useEffect, useRef } from 'react';
import Section from './Section/Section';
import classes from './ProductsList.module.scss';
import { MenuCategory } from '@lo/shared/types/menuType';
import { useCategoriesVisibility } from '../hooks/useCategoriesVisibility';
import { useOutOfStockFilterIsActive } from '@lo/shared/store/menuOutOfStockFilter';
import { useSearchFilterIsActive } from '@lo/shared/store/menuSearchFilter';
import analitycs from '@lo/shared/services/analytics';
import ListHeader from './ListHeader/ListHeader';

export type ProductsListProps = {
    menuCategories: MenuCategory[];
    selectedCategoryId: number | null;
    onActiveCategoryChange: (id: number) => void;
};

const ProductsList: React.FC<ProductsListProps> = (props) => {
    const { menuCategories, selectedCategoryId, onActiveCategoryChange } = props;
    const { sectionsVisibility, updateSectionsVisibility } = useCategoriesVisibility(menuCategories);
    const isOutOfStockFilterActive = useOutOfStockFilterIsActive();
    const isSearchFilterActive = useSearchFilterIsActive();
    const sectionsPositionsRef = useRef<(number | null)[]>([]);
    const visibleCategory = sectionsVisibility.findIndex((isVisible) => isVisible);
    const isScrollToTopVisible = window.scrollY > window.innerHeight;

    const onScrollToTop = () => {
        analitycs.menu.scrolledToTop();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        onActiveCategoryChange(visibleCategory);
    }, [visibleCategory]);

    useEffect(() => {
        if (selectedCategoryId === null) return;
        const sectionPosition = sectionsPositionsRef.current[selectedCategoryId];
        if (sectionPosition === null || sectionPosition === undefined) return;
        window.scroll(0, sectionPosition);
    }, [selectedCategoryId]);

    useEffect(() => {
        window.scroll(0, 0);
    }, [isOutOfStockFilterActive, isSearchFilterActive]);

    return (
        <div className={classes.listContainer}>
            <ListHeader menuCategories={menuCategories} />
            <div className={classes.sectionsList} data-testid="category-list">
                {menuCategories.map((category, index) => (
                    <Section
                        key={category.id + category.name}
                        ref={(offsetTop) => {
                            sectionsPositionsRef.current[category.id] = offsetTop ?? null;
                        }}
                        onVisibilityChange={updateSectionsVisibility(index)}
                        data={category}
                    />
                ))}
            </div>

            {isScrollToTopVisible ? (
                <button className={classes.scrollToTopButton} onClick={onScrollToTop} data-testid="scroll-to-top-button">
                    <div className={classes.scrollToTopIcon} />
                </button>
            ) : null}
        </div>
    );
};

export default ProductsList;
