import { useEffect, useState } from 'react';
import { differenceInMinutes, isToday } from 'date-fns';
import { skipTokens } from '@jet-pie/theme/variations/skip';
import { formatTime } from '@lo/shared/helpers/formatTime';
import useRestaurant from '@lo/shared/hooks/useRestaurant';
import OrderModel from '@lo/shared/models/OrderModel';
import { useLocalNotificationsActions } from '../store/localNotifications';

export default (order: OrderModel) => {
    const restaurant = useRestaurant();
    const isWaitingForCourier = order.is_waiting_for_courier(restaurant);
    const { pushNotification } = useLocalNotificationsActions();
    const [minutesLeft, setMinutesLeft] = useState<number | null>(null);

    const requestedTime = order.requested_time ? formatTime(order.requested_time, undefined, restaurant.timezone) : 'ASAP';
    const deliveredTime = order.is_delivered
        ? formatTime(order.delivery_time || order.requested_time, undefined, restaurant.timezone)
        : null;

    const showDate = order.requested_time && !isToday(order.requested_time);
    const showCountdown =
        !showDate && (isWaitingForCourier || order.is_in_delivery || (minutesLeft !== null && minutesLeft <= 60));
    const showTime = !showDate && !showCountdown && !order.is_cancelled;

    const requestedDate = order.requested_time?.toLocaleDateString(undefined, {
        month: '2-digit',
        day: '2-digit'
    });

    function getMinutesLeftValue() {
        if (order.is_new || order.is_cancelled || order.is_delivered || isWaitingForCourier) {
            return null;
        }

        let countUntilDate: Date | null = null;

        // There's no pickup_time for JE orders. Using delivery_time for timer instead.
        switch (order.status) {
            case 'new':
                countUntilDate = order.requested_time;
                break;
            case 'confirmed':
                countUntilDate = order.pickup_time || order.delivery_time || order.requested_time;
                break;
            case 'kitchen':
                countUntilDate = order.pickup_time || order.delivery_time;
                break;
            case 'in_delivery':
                countUntilDate = order.delivery_time || order.requested_time;
                break;
        }

        return countUntilDate && differenceInMinutes(countUntilDate, new Date());
    }

    function getProgressBarFillPercentage() {
        if (order.is_new || showDate || (showTime && !order.is_delivered)) return null;

        if (order.is_cancelled || order.is_delivered) return 100;

        if (minutesLeft === null) return 0;

        const result = (100 * minutesLeft) / 60;
        return Math.min(100, Math.max(0, result));
    }

    function getProgressBarData() {
        const fillPercentage = getProgressBarFillPercentage();
        if (fillPercentage === null) return null;

        const size = 56;
        const width = 3;
        const center = size / 2;
        const radius = center - width + 1;
        const dashArray = 2 * Math.PI * radius;

        const color = order.is_cancelled
            ? skipTokens.alias.light.contentError
            : minutesLeft && minutesLeft <= 10
              ? skipTokens.alias.light.supportWarning
              : skipTokens.alias.light.supportPositive;

        return {
            size,
            width,
            center,
            radius,
            color,
            dashArray,
            dashOffset: dashArray * ((100 - fillPercentage) / 100)
        };
    }

    useEffect(() => {
        setMinutesLeft(getMinutesLeftValue());

        let timerId: NodeJS.Timeout;

        if (!order.is_cancelled && !order.is_delivered) {
            timerId = setInterval(() => {
                setMinutesLeft(getMinutesLeftValue());
            }, 60000);
        }

        return () => clearInterval(timerId);
    }, [order]);

    /** Show notification */
    useEffect(() => {
        if (
            minutesLeft !== null &&
            order.is_preorder &&
            order.delivery_time_duration &&
            order.food_preparation_duration &&
            minutesLeft - order.delivery_time_duration === order.food_preparation_duration
        ) {
            pushNotification(restaurant.reference, 'PrepareOrder', order);
        }
    }, [minutesLeft]);

    return {
        progressBar: getProgressBarData(),
        minutesLeft,
        showDate,
        showCountdown,
        showTime,
        requestedTime,
        deliveredTime,
        requestedDate,
        isDelayed: minutesLeft !== null && minutesLeft <= 0
    };
};
