import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { createDateRange, DateRange, DateRangeName, isSameDateRange } from '../helpers/dates';
import { OrderHistorySortingColumn, OrderHistorySortingDirection } from '../types/orderHistoryType';
import OrderHistoryItemModel from '../models/OrderHistoryItemModel';

export const OrderHistoryStatusesFilterValues = ['in_progress', 'cancelled', 'delivered'] as const;
export type OrderHistoryStatusesFilterValue = (typeof OrderHistoryStatusesFilterValues)[number];

export const OrderHistoryPaymentMethodsFilterValues = ['cash', 'card'] as const;
export type OrderHistoryPaymentsFilterValue = (typeof OrderHistoryPaymentMethodsFilterValues)[number];

export type OrderHistoryFilterValue = OrderHistoryStatusesFilterValue | OrderHistoryPaymentsFilterValue;

export type OrderHistoryFilters = {
    statuses: OrderHistoryStatusesFilterValue[];
    paymentMethods: OrderHistoryPaymentsFilterValue[];
};

type OrderHistoryStoreType = {
    dateRange: DateRange;
    filters: OrderHistoryFilters;
    sorting: {
        column: OrderHistorySortingColumn;
        direction: OrderHistorySortingDirection;
    };
    search: {
        value: string;
        results: OrderHistoryItemModel[];
        isActive: boolean;
    };
    actions: {
        setDateRange: (dateRange: DateRange | Exclude<DateRangeName, 'custom'>) => void;
        resetDateRange: () => void;
        applyFilters(filters: OrderHistoryFilters): void;
        removeFilterValue(filter: keyof OrderHistoryFilters, value: string): void;
        resetFilters: () => void;
        setSorting: (column: OrderHistorySortingColumn, direction: OrderHistorySortingDirection) => void;
        searchClear: () => void;
        searchApply: () => void;
        searchUpdate: (value: string) => void;
        setSearchValue: (value: string) => void;
        searchSetResults: (results: OrderHistoryItemModel[]) => void;
    };
};

export const useOrderHistory = create<OrderHistoryStoreType>((set, get) => ({
    dateRange: createDateRange('today'),
    filters: {
        statuses: [],
        paymentMethods: []
    },
    search: {
        value: '',
        results: [],
        isActive: false
    },
    sorting: {
        column: 'placed_date',
        direction: 'desc'
    },
    actions: {
        setDateRange: (date) => {
            const dateRange = typeof date === 'string' ? createDateRange(date) : date;

            if (!isSameDateRange(dateRange, get().dateRange)) {
                set({ dateRange });
            }
        },
        resetDateRange: () => set({ dateRange: createDateRange('today') }),
        applyFilters: (filters) => set({ filters }),
        removeFilterValue: (filter, value) => {
            const existingValues: string[] = get().filters[filter];

            set((state) => ({
                filters: {
                    ...state.filters,
                    [filter]: existingValues.filter((filterValue) => filterValue !== value)
                }
            }));
        },
        resetFilters: () => set({ filters: { statuses: [], paymentMethods: [] } }),
        setSorting: (column, direction) => set({ sorting: { column, direction } }),
        searchClear: () => {
            set({ search: { value: '', results: [], isActive: false } });
        },
        searchApply: () => {
            set(({ search }) => ({ search: { ...search, isActive: true } }));
        },
        searchUpdate: (value) => {
            set(({ search }) => ({ search: { ...search, value, isActive: false } }));
        },
        setSearchValue: (value) => {
            set(({ search }) => ({ search: { ...search, value, isActive: false } }));
        },
        searchSetResults: (results) => set(({ search }) => ({ search: { ...search, results } }))
    }
}));

/** Hooks */
export const useOrderHistoryDateRange = () => useOrderHistory((state) => state.dateRange);

export const useOrderHistoryFilters = () => useOrderHistory((state) => state.filters);
export const useOrderHistoryFiltersValues = () => useOrderHistory(useShallow((state) => Object.values(state.filters).flat()));

export const useOrderHistorySorting = () => useOrderHistory((state) => state.sorting);

export const useOrderHistoryActions = () => useOrderHistory((state) => state.actions);
export const useOrderHistorySearch = () => useOrderHistory((state) => state.search);
export const useOrderHistorySearchValue = () => useOrderHistory((state) => state.search.value);
