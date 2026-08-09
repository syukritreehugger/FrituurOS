import { compareAsc, compareDesc } from 'date-fns';
import { OrderHistoryDataItem } from '../../types/orderHistoryType';
import { OrderModel } from '../../models';
import { getField } from '../array/nestedArray';

export enum Direction {
    ASCENDING = 'asc',
    DESCENDING = 'desc'
}

export type CompareFunctionType = (
    orderA: OrderModel | OrderHistoryDataItem,
    orderB: OrderModel | OrderHistoryDataItem
) => number;

export const compareDateField = (field: string, direction: Direction): CompareFunctionType => {
    const compare = direction === Direction.ASCENDING ? compareAsc : compareDesc;
    return (a, b) => compare(getField(a, field) as Date, getField(b, field) as Date);
};

export const compareTextField = (field: string, direction: Direction): CompareFunctionType => {
    if (direction === Direction.ASCENDING) {
        return (a, b) => (getField(a, field) as string)?.localeCompare(getField(b, field) as string);
    } else {
        return (a, b) => (getField(b, field) as string)?.localeCompare(getField(a, field) as string);
    }
};

export const compareNumberField = (field: string, direction: Direction): CompareFunctionType => {
    if (direction === Direction.ASCENDING) {
        return (a, b) => (getField(a, field) as number) - (getField(b, field) as number);
    } else {
        return (a, b) => (getField(b, field) as number) - (getField(a, field) as number);
    }
};
