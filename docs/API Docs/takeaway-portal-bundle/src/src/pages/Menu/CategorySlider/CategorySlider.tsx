import React, { useEffect, useRef } from 'react';
import { MenuCategory } from '@lo/shared/types/menuType';
import Arrow from './Arrow/Arrow';
import classes from './CategorySlider.module.scss';
import CategoryChip from './CategoryChip/CategoryChip';
import { useCategoriesVisibility } from '../hooks/useCategoriesVisibility';
import { useOutOfStockCategoryIds, useOutOfStockFilterIsActive } from '@lo/shared/store/menuOutOfStockFilter';

type CategorySliderProps = {
    menuCategories: MenuCategory[];
    activeCategoryIndex: number | null;
    onCategorySelect: (index: number) => void;
};

const SCROLL_VALUE = 250;

const CategorySlider: React.FC<CategorySliderProps> = (props) => {
    const { menuCategories, activeCategoryIndex, onCategorySelect } = props;
    const { sectionsVisibility, updateSectionsVisibility } = useCategoriesVisibility(menuCategories);
    const outOfStockCategoryIds = useOutOfStockCategoryIds();
    const isFiltersActive = useOutOfStockFilterIsActive();
    const chipsPositionsRef = useRef<(number | null)[]>([]);
    const sliderRef = useRef<HTMLDivElement | null>(null);

    const isLeftArrowVisible = !sectionsVisibility[0];
    const isRightArrowVisible = !sectionsVisibility[sectionsVisibility.length - 1];

    useEffect(() => {
        if (activeCategoryIndex === null) return;

        const chipPosition = chipsPositionsRef.current[activeCategoryIndex];
        if (chipPosition === null || chipPosition === undefined) return;

        sliderRef.current?.scrollTo({
            left: chipPosition - 110,
            behavior: 'smooth'
        });
    }, [activeCategoryIndex]);

    const scrollSlider = (value: 'left' | 'right') => () => {
        sliderRef.current?.scrollTo({
            left: sliderRef.current.scrollLeft + (value === 'left' ? -SCROLL_VALUE : SCROLL_VALUE),
            behavior: 'smooth'
        });
    };

    if (menuCategories.length === 0) return null;
    return (
        <div className={classes.sliderContainer}>
            <div className={classes.slider} ref={sliderRef}>
                {isLeftArrowVisible && <Arrow direction="left" onClick={scrollSlider('left')} />}
                {menuCategories.map((category, index) => (
                    <CategoryChip
                        key={category.name + index}
                        ref={(offsetLeft) => {
                            chipsPositionsRef.current[index] = offsetLeft ?? null;
                        }}
                        label={`${category.name} (${category.products?.length})`}
                        selected={index === activeCategoryIndex}
                        onClick={() => onCategorySelect(category.id)}
                        onVisibilityChange={updateSectionsVisibility(index)}
                        dataTestId={'category-slider-item-' + category.id}
                    />
                ))}
                {isFiltersActive &&
                    outOfStockCategoryIds.map((categoryName, index) => (
                        <CategoryChip
                            disabled
                            key={categoryName + index}
                            ref={(offsetLeft) => {
                                chipsPositionsRef.current[menuCategories.length + index] = offsetLeft ?? null;
                            }}
                            label={categoryName}
                            onVisibilityChange={updateSectionsVisibility(menuCategories.length + index)}
                            dataTestId={'category-slider-item-' + categoryName + '-disabled'}
                        />
                    ))}
                {isRightArrowVisible && <Arrow direction="right" onClick={scrollSlider('right')} />}
            </div>
        </div>
    );
};

export default CategorySlider;
