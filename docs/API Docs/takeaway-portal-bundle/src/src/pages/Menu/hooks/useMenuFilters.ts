import { MenuCategory, MenuProduct } from '@lo/shared/types/menuType';
import { useOutOfStockFilterActions, useOutOfStockFilterIsActive } from '@lo/shared/store/menuOutOfStockFilter';
import { useSearchFilterActions, useSearchFilterIsActive, useSearchFilterValue } from '@lo/shared/store/menuSearchFilter';
import { useEffect, useMemo } from 'react';

type UseMenuFiltersReturnType = {
    data: MenuCategory[];
};

const filterProduct = (product: MenuProduct, searchFilter: string) =>
    product.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    product.id.toString().includes(searchFilter.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (product.code ? '#' + product.code : '').toLowerCase().includes(searchFilter.toLowerCase());

export const useMenuFilters = (data: MenuCategory[]): UseMenuFiltersReturnType => {
    const isOutOfStockFilterActive = useOutOfStockFilterIsActive();
    const actions = useOutOfStockFilterActions();
    const isSearchFilterActive = useSearchFilterIsActive();
    const searchFilterValue = useSearchFilterValue();
    const { setResults } = useSearchFilterActions();

    const filteredData = useMemo(() => {
        if (!isOutOfStockFilterActive && !searchFilterValue) return data;
        const newData = data.map((category) => {
            const newCategory = { ...category };
            if (isOutOfStockFilterActive) newCategory.products = newCategory.products?.filter((product) => product.sold_out);
            if (isSearchFilterActive && searchFilterValue)
                newCategory.products = newCategory.products?.filter((product) => filterProduct(product, searchFilterValue));
            return newCategory;
        });
        return newData.filter((category) => category.products && category.products.length > 0);
    }, [data, isOutOfStockFilterActive, searchFilterValue, isSearchFilterActive]);

    useEffect(() => {
        setResults(
            searchFilterValue.length > 1
                ? filteredData
                      .flatMap((category) => category.products || [])
                      .filter((product) => filterProduct(product, searchFilterValue))
                      .map((item) => ({
                          id: item.id.toString(),
                          code: item.code,
                          name: item.name
                      }))
                : []
        );
    }, [filteredData]);

    useEffect(() => {
        actions.setAmount(
            data.reduce((counter, category) => {
                if (!category.products) return counter;
                return counter + category.products.length;
            }, 0)
        );
    }, [data]);

    useEffect(() => {
        actions.setCounter(
            data.reduce((counter, category) => {
                if (!category.products) return counter;
                return counter + category.products.filter((product) => product.sold_out).length;
            }, 0)
        );
    }, [data]);

    useEffect(() => {
        actions.setOutOfStockCategoryIds(
            data
                .filter((category) => filteredData.findIndex((item) => item.id === category.id) < 0)
                .map((category) => category.name)
        );
    }, [data]);

    useEffect(() => {
        actions.setOutOfStockProductIds(
            data
                .flatMap((category) => category.products || [])
                .filter((product) => product.sold_out)
                .map((product) => product.id)
        );
    }, [data]);

    return {
        data: filteredData
    };
};
