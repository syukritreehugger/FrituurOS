import { RestaurantModel } from '../../models';
import { addMinutes, differenceInMinutes, isPast, isFuture, format } from 'date-fns';
import { TFunction } from 'i18next';
import { WorktimeSlot } from '../../types/worktimeSlotType';

export const getOpenTimeTranslation = (t: TFunction, value?: number): string | undefined => {
    if (!value) {
        return undefined;
    }
    const newTime = addMinutes(new Date(), value);
    return t('orders.live_orders_settings.restaurant.open_at', { time: format(newTime, 'HH:mm') }) || undefined;
};

export const getActiveTimeSlot = (restaurant: RestaurantModel, toggleType: 'pickup' | 'delivery'): WorktimeSlot | undefined => {
    return getAllActiveTimeSlots(restaurant, toggleType)?.[0];
};

export const getAllActiveTimeSlots = (
    restaurant: RestaurantModel,
    toggleType: 'pickup' | 'delivery'
): WorktimeSlot[] | undefined => {
    return restaurant.worktime_slots?.filter((slot) => {
        const dateFrom = new Date(slot.date_from);
        const dateTo = new Date(slot.date_to);

        return slot.type === toggleType && !slot.is_open && isPast(dateFrom) && isFuture(dateTo);
    });
};

export const getSlotTimeLeft = (worktimeSlot: WorktimeSlot): number | undefined => {
    return worktimeSlot.date_to ? differenceInMinutes(new Date(worktimeSlot.date_to), new Date()) : undefined;
};

export enum ReasonsEnum {
    busyKitchen = 'busy_kitchen',
    noCouriers = 'no_couriers',
    somethingElse = 'something_else'
}

export enum DurationOptionsEnum {
    tomorrow = 'tomorrow',
    sixtyMinutes = 'sixty_min',
    twentyMinutes = 'twenty_min'
}

export const reasonOptions = (t: TFunction, restaurantData: RestaurantModel): { title: string; id: ReasonsEnum }[] => {
    if (!restaurantData.can_toggle_delivery) {
        return [
            { title: t('orders.live_orders_settings.restaurant.reason_busy_kitchen'), id: ReasonsEnum.busyKitchen },
            { title: t('orders.live_orders_settings.restaurant.reason_something_else'), id: ReasonsEnum.somethingElse }
        ];
    }

    return [
        { title: t('orders.live_orders_settings.restaurant.reason_busy_kitchen'), id: ReasonsEnum.busyKitchen },
        { title: t('orders.live_orders_settings.restaurant.reason_no_couriers'), id: ReasonsEnum.noCouriers },
        { title: t('orders.live_orders_settings.restaurant.reason_something_else'), id: ReasonsEnum.somethingElse }
    ];
};

export const durationOptions = (t: TFunction): { title: string; id: DurationOptionsEnum }[] => [
    { title: t('orders.live_orders_settings.restaurant.tomorrow'), id: DurationOptionsEnum.tomorrow },
    { title: '60 min', id: DurationOptionsEnum.sixtyMinutes },
    { title: '20 min', id: DurationOptionsEnum.twentyMinutes }
];

export const durationValues = {
    [DurationOptionsEnum.tomorrow]: undefined,
    [DurationOptionsEnum.sixtyMinutes]: 60,
    [DurationOptionsEnum.twentyMinutes]: 20
};

export const untilTomorrowStatusTitle = (t: TFunction, isRestaurantClosed: boolean): string =>
    isRestaurantClosed
        ? t('orders.live_orders_settings.restaurant.closed_until_tomorrow')
        : t('orders.live_orders_settings.restaurant.paused_until_tomorrow');

export const minutesStatusTitle = (t: TFunction, isRestaurantClosed: boolean, minutes: number): string =>
    isRestaurantClosed
        ? t('orders.live_orders_settings.restaurant.closed_for_minutes', { minutes })
        : t('orders.live_orders_settings.restaurant.paused_for_minutes', { minutes });
