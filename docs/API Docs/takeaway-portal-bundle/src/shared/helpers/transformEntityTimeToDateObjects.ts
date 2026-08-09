import { parseISO } from 'date-fns';
import { getField, setField } from './array/nestedArray';

export default function <T>(payload: T): T {
    const fieldsToTransform = [
        'placed_date',
        'created_at',
        'createdAt',
        'cancelled_at',
        'requested_time',
        'restaurant_estimated_pickup_time',
        'delivery_service_pickup_time',
        'restaurant_estimated_delivery_time',
        'delivery_service_delivery_time',
        'nextAvailableAt',
        'back_to_stock_at',
        'context.estimatedAtDeliveryPointTime',
        'context.estimatedAtRestaurantTime'
    ];

    // The backend will convert to the format yyyy-mm-ddTHH:mm:ssZ
    // for backwards compatibility reasons, we're still going to check and possibly customise the input
    const isoFormat = (dateString: string): string => {
        if (!dateString.includes(' ')) {
            return dateString;
        }

        dateString = dateString.replace(' ', 'T');
        const hasTimezone = dateString.match(/([+-][0-9]{2}:[0-9]{2}|Z)$/);

        if (!hasTimezone) {
            dateString += 'Z';
        }

        return dateString;
    };

    const formatEntityDateTime = <Type>(entity: Type): void => {
        fieldsToTransform.forEach((field) => {
            if (getField(entity, field) && typeof getField(entity, field) === 'string') {
                const value = isoFormat(getField(entity, field) as string);
                const newValue = parseISO(value);
                setField<typeof entity, Date>(entity, field, newValue);
            }
        });
    };

    if (Array.isArray(payload)) {
        payload.forEach((element) => formatEntityDateTime(element));
    } else {
        formatEntityDateTime(payload);
    }

    return payload;
}
