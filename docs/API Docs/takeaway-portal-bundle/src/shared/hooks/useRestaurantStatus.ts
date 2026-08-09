import { useState, useEffect, useRef } from 'react';
import { getActiveTimeSlot, getAllActiveTimeSlots, getSlotTimeLeft } from '../helpers/worktime/worktimeSlotsHelpers';
import useCreateWorkTimeSlot from './useCreateWorkTimeSlot';
import useDeleteWorkTimeSlot from './useDeleteWorktimeSlot';
import useRestaurant from './useRestaurant';

export type ToggleType = 'all' | 'delivery' | 'pickup';
export type CloseRestaurantEvent = (type: ToggleType, reason: string, duration?: number) => void;
export type OpenRestaurantEvent = (type?: ToggleType) => void;

export type WorktimeStatus = {
    isClosed: boolean;
    isDeliveryClosed: boolean;
    isPickupClosed: boolean;
    minutesLeft?: number;
    deliveryMinutesLeft?: number;
    pickupMinutesLeft?: number;
    closeRestaurant: CloseRestaurantEvent;
    openRestaurant: OpenRestaurantEvent;
};
type UseRestaurantStatus = () => WorktimeStatus;

export const useRestaurantStatus: UseRestaurantStatus = () => {
    const restaurant = useRestaurant();
    const deliveryTimeSlot = getActiveTimeSlot(restaurant, 'delivery');
    const pickupTimeSlot = getActiveTimeSlot(restaurant, 'pickup');
    const [deliveryMinutesLeft, setDeliveryMinutesLeft] = useState<number>();
    const [pickupMinutesLeft, setPickupMinutesLeft] = useState<number>();
    const deliveryIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const pickupIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const { mutate: createWorkTimeSlot } = useCreateWorkTimeSlot();
    const { mutate: deleteWorkTimeSlot } = useDeleteWorkTimeSlot();

    useEffect(() => {
        const newMinutes = deliveryTimeSlot ? getSlotTimeLeft(deliveryTimeSlot) : undefined;
        setDeliveryMinutesLeft(newMinutes);
    }, [deliveryTimeSlot]);

    useEffect(() => {
        const newMinutes = pickupTimeSlot ? getSlotTimeLeft(pickupTimeSlot) : undefined;
        setPickupMinutesLeft(newMinutes);
    }, [pickupTimeSlot]);

    useEffect(() => {
        if (!deliveryMinutesLeft || deliveryMinutesLeft > 60) return;
        deliveryIntervalRef.current = setInterval(() => {
            setDeliveryMinutesLeft((value) => (value ? value - 1 : undefined));
        }, 60000);
        return () => clearInterval(deliveryIntervalRef.current);
    }, [deliveryMinutesLeft]);

    useEffect(() => {
        if (!pickupMinutesLeft || pickupMinutesLeft > 60) return;
        pickupIntervalRef.current = setInterval(() => {
            setPickupMinutesLeft((value) => (value ? value - 1 : undefined));
        }, 60000);
        return () => clearInterval(pickupIntervalRef.current);
    }, [pickupMinutesLeft]);

    const handleCloseRestaurant: CloseRestaurantEvent = (type, reason, duration) => {
        if (!restaurant.can_toggle_delivery && type === 'all') {
            type = 'pickup';
        }

        createWorkTimeSlot({ type, reason, duration });
    };

    const handleOpenRestaurant = (type: 'all' | 'delivery' | 'pickup' = 'all') => {
        if ((type === 'pickup' || type === 'all') && pickupTimeSlot) {
            const pickupSlots = getAllActiveTimeSlots(restaurant, 'pickup');
            pickupSlots?.forEach((slot) => deleteWorkTimeSlot({ slot }));
        }
        if ((type === 'delivery' || type === 'all') && deliveryTimeSlot) {
            const deliverySlots = getAllActiveTimeSlots(restaurant, 'delivery');
            deliverySlots?.forEach((slot) => deleteWorkTimeSlot({ slot }));
        }
    };

    return {
        isClosed: !!(deliveryMinutesLeft && pickupMinutesLeft),
        isDeliveryClosed: !!deliveryMinutesLeft,
        isPickupClosed: !!pickupMinutesLeft,
        minutesLeft:
            deliveryMinutesLeft && pickupMinutesLeft && deliveryMinutesLeft < pickupMinutesLeft
                ? deliveryMinutesLeft
                : pickupMinutesLeft,
        deliveryMinutesLeft,
        pickupMinutesLeft,
        closeRestaurant: handleCloseRestaurant,
        openRestaurant: handleOpenRestaurant
    };
};
