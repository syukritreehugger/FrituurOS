import { isSameDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';

export type DateRange = [Date, Date];

export const DateRangeNames = [
    'today',
    'yesterday',
    'this_week',
    'last_seven_days',
    'this_month',
    'last_four_weeks',
    'last_month'
] as const;

export type DateRangeName = (typeof DateRangeNames)[number];

export const createDateRange = (rangeName: Exclude<DateRangeName, 'custom'>): DateRange => {
    const today = new Date();

    let startDate = new Date();
    let endDate = new Date();

    switch (rangeName) {
        case 'today':
            break;
        case 'yesterday':
            startDate = subDays(today, 1);
            endDate = subDays(today, 1);
            break;
        case 'this_week':
            startDate = startOfWeek(today, { weekStartsOn: 1 });
            break;
        case 'last_seven_days':
            startDate = subWeeks(today, 1);
            break;
        case 'this_month':
            startDate = startOfMonth(today);
            break;
        case 'last_four_weeks':
            startDate = subWeeks(today, 4);
            break;
        case 'last_month':
            startDate = subMonths(today, 1);
            break;
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return [startDate, endDate];
};

export const isSameDateRange = (rangeA: DateRange, rangeB: DateRange | DateRangeName): boolean => {
    if (typeof rangeB === 'string') {
        return isSameDateRange(rangeA, createDateRange(rangeB));
    }

    return isSameDay(rangeA[0], rangeB[0]) && isSameDay(rangeA[1], rangeB[1]);
};

export const getDateRangeName = (range: DateRange) => {
    return Object.values(DateRangeNames).find((key) => {
        const rangeName = createDateRange(key);
        return isSameDateRange(rangeName, range);
    });
};
