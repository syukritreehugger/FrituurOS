import { compareDateField, compareNumberField, compareTextField, Direction } from './sortingFieldFunctions';
import { OrderHistoryDataItem, OrderHistorySortingValue } from '../../types/orderHistoryType';

export type SortingFunctionType = ((orderHistory: OrderHistoryDataItem[]) => OrderHistoryDataItem[]) | null;

const sortByPlacedTimeAsc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareDateField('placed_date', Direction.ASCENDING));
};

const sortByPlacedTimeDesc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareDateField('placed_date', Direction.DESCENDING));
};

const sortByOrderAsc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareTextField('public_reference', Direction.ASCENDING));
};

const sortByOrderDesc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareTextField('public_reference', Direction.DESCENDING));
};

const sortByNameAsc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareTextField('customer.full_name', Direction.ASCENDING));
};

const sortByNameDesc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareTextField('customer.full_name', Direction.DESCENDING));
};

const sortByTotalAsc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareNumberField('restaurant_total', Direction.ASCENDING));
};

const sortByTotalDesc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareNumberField('restaurant_total', Direction.DESCENDING));
};

const sortByAddressAsc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareTextField('customer.street', Direction.ASCENDING));
};

const sortByAddressDesc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareTextField('customer.street', Direction.DESCENDING));
};

const sortByStatusAsc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareTextField('status', Direction.ASCENDING));
};

const sortByStatusDesc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareTextField('status', Direction.DESCENDING));
};

const sortByPaymentAsc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareTextField('payment_type', Direction.ASCENDING));
};

const sortByPaymentDesc: SortingFunctionType = (orderHistory) => {
    return orderHistory?.sort(compareTextField('payment_type', Direction.DESCENDING));
};

const defineSortingType: Record<OrderHistorySortingValue, SortingFunctionType> = {
    'placed_date.asc': sortByPlacedTimeAsc,
    'placed_date.desc': sortByPlacedTimeDesc,
    'public_reference.asc': sortByOrderAsc,
    'public_reference.desc': sortByOrderDesc,
    'name.asc': sortByNameAsc,
    'name.desc': sortByNameDesc,
    'total.asc': sortByTotalAsc,
    'total.desc': sortByTotalDesc,
    'address.asc': sortByAddressAsc,
    'address.desc': sortByAddressDesc,
    'status.asc': sortByStatusAsc,
    'status.desc': sortByStatusDesc,
    'payment.asc': sortByPaymentAsc,
    'payment.desc': sortByPaymentDesc
};

const getSortingFunction = (type: OrderHistorySortingValue | null): SortingFunctionType => {
    return (type && defineSortingType[type]) || null;
};

export const sortOrderHistoryItems = (
    data: OrderHistoryDataItem[],
    sorting: OrderHistorySortingValue | null
): OrderHistoryDataItem[] => {
    const sortingFunction = getSortingFunction(sorting);
    return sortingFunction ? sortingFunction(data) : data;
};
